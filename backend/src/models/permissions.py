"""
Permission system for role-based access control in TIES Together platform
"""

from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from .user import User

# Define role-based permissions
ROLE_PERMISSIONS = {
    'freelancer': {
        'can_create_portfolio': True,
        'can_accept_bookings': True,
        'can_bid_on_projects': True,
        'can_create_basic_projects': False,
        'can_create_studio_projects': False,
        'can_manage_team': False,
        'can_access_analytics': False,
        'can_verify_others': False,
        'max_portfolio_items': 10,
        'max_projects': 3,
        'can_use_advanced_search': False,
        'can_export_data': False
    },
    'organiser': {
        'can_create_portfolio': True,
        'can_accept_bookings': False,
        'can_bid_on_projects': False,
        'can_create_basic_projects': True,
        'can_create_studio_projects': False,
        'can_manage_team': True,
        'can_access_analytics': True,
        'can_verify_others': False,
        'max_portfolio_items': 15,
        'max_projects': 10,
        'can_use_advanced_search': True,
        'can_export_data': False
    },
    'venue': {
        'can_create_portfolio': True,
        'can_accept_bookings': True,
        'can_bid_on_projects': False,
        'can_create_basic_projects': False,
        'can_create_studio_projects': False,
        'can_manage_team': False,
        'can_access_analytics': True,
        'can_verify_others': False,
        'max_portfolio_items': 20,
        'max_projects': 5,
        'can_use_advanced_search': True,
        'can_export_data': False
    },
    'vendor': {
        'can_create_portfolio': True,
        'can_accept_bookings': True,
        'can_bid_on_projects': True,
        'can_create_basic_projects': False,
        'can_create_studio_projects': False,
        'can_manage_team': False,
        'can_access_analytics': True,
        'can_verify_others': False,
        'max_portfolio_items': 15,
        'max_projects': 5,
        'can_use_advanced_search': True,
        'can_export_data': False
    },
    'collective': {
        'can_create_portfolio': True,
        'can_accept_bookings': True,
        'can_bid_on_projects': True,
        'can_create_basic_projects': True,
        'can_create_studio_projects': True,
        'can_manage_team': True,
        'can_access_analytics': True,
        'can_verify_others': False,
        'max_portfolio_items': 50,
        'max_projects': 25,
        'can_use_advanced_search': True,
        'can_export_data': True
    }
}

# Subscription tier permissions
SUBSCRIPTION_PERMISSIONS = {
    'free': {
        'max_portfolio_items_bonus': 0,
        'max_projects_bonus': 0,
        'can_use_studio': False,
        'can_use_advanced_analytics': False,
        'can_use_priority_support': False,
        'can_use_custom_branding': False,
        'commission_rate': 0.10,  # 10%
        'can_export_data': False,
        'max_file_upload_mb': 10
    },
    'pro': {
        'max_portfolio_items_bonus': 10,
        'max_projects_bonus': 5,
        'can_use_studio': False,
        'can_use_advanced_analytics': True,
        'can_use_priority_support': True,
        'can_use_custom_branding': False,
        'commission_rate': 0.08,  # 8%
        'can_export_data': True,
        'max_file_upload_mb': 50
    },
    'studio_pro': {
        'max_portfolio_items_bonus': 25,
        'max_projects_bonus': 15,
        'can_use_studio': True,
        'can_use_advanced_analytics': True,
        'can_use_priority_support': True,
        'can_use_custom_branding': True,
        'commission_rate': 0.05,  # 5%
        'can_export_data': True,
        'max_file_upload_mb': 200
    }
}

# Admin permissions
ADMIN_PERMISSIONS = {
    'can_verify_users': True,
    'can_moderate_content': True,
    'can_access_all_analytics': True,
    'can_manage_subscriptions': True,
    'can_manage_platform_settings': True,
    'can_export_all_data': True,
    'can_impersonate_users': True
}

def get_user_permissions(user):
    """Get combined permissions for a user based on role and subscription"""
    if not user:
        return {}
    
    # Start with role-based permissions
    permissions = ROLE_PERMISSIONS.get(user.role, {}).copy()
    
    # Add subscription-based permissions
    subscription_perms = SUBSCRIPTION_PERMISSIONS.get(user.subscription_type, {})
    
    # Merge subscription permissions
    for key, value in subscription_perms.items():
        if key.endswith('_bonus'):
            # Add bonus to existing limits
            base_key = key.replace('_bonus', '')
            if base_key in permissions:
                permissions[base_key] += value
        else:
            permissions[key] = value
    
    # Add admin permissions if user is admin
    if hasattr(user, 'is_admin') and user.is_admin:
        permissions.update(ADMIN_PERMISSIONS)
    
    return permissions

def require_permission(permission_name):
    """Decorator to require specific permission for route access"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                permissions = get_user_permissions(user)
                
                if not permissions.get(permission_name, False):
                    return jsonify({
                        'error': 'Insufficient permissions',
                        'required_permission': permission_name,
                        'user_role': user.role,
                        'subscription_type': user.subscription_type
                    }), 403
                
                # Store user and permissions in g for use in route
                g.current_user = user
                g.user_permissions = permissions
                
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Permission check failed'}), 500
        
        return decorated_function
    return decorator

def require_role(allowed_roles):
    """Decorator to require specific role(s) for route access"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                if user.role not in allowed_roles:
                    return jsonify({
                        'error': 'Role not authorized',
                        'required_roles': allowed_roles,
                        'user_role': user.role
                    }), 403
                
                # Store user in g for use in route
                g.current_user = user
                g.user_permissions = get_user_permissions(user)
                
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Role check failed'}), 500
        
        return decorated_function
    return decorator

def require_subscription(min_subscription):
    """Decorator to require minimum subscription level"""
    subscription_hierarchy = ['free', 'pro', 'studio_pro']
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                user = User.query.get(current_user_id)
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                user_level = subscription_hierarchy.index(user.subscription_type)
                required_level = subscription_hierarchy.index(min_subscription)
                
                if user_level < required_level:
                    return jsonify({
                        'error': 'Subscription upgrade required',
                        'current_subscription': user.subscription_type,
                        'required_subscription': min_subscription
                    }), 402  # Payment Required
                
                # Store user in g for use in route
                g.current_user = user
                g.user_permissions = get_user_permissions(user)
                
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Subscription check failed'}), 500
        
        return decorated_function
    return decorator

def check_resource_limit(resource_type, current_count):
    """Check if user has reached their resource limit"""
    user = g.get('current_user')
    permissions = g.get('user_permissions', {})
    
    if not user or not permissions:
        return False, "User permissions not available"
    
    limit_key = f'max_{resource_type}'
    max_allowed = permissions.get(limit_key, 0)
    
    if current_count >= max_allowed:
        return False, f"Resource limit reached. Maximum {resource_type}: {max_allowed}"
    
    return True, None

def get_commission_rate(user):
    """Get commission rate for user based on subscription"""
    permissions = get_user_permissions(user)
    return permissions.get('commission_rate', 0.10)  # Default 10%

