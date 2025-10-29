from flask import Blueprint, jsonify, request, session
from src.models.user import User, db, PortfolioItem

user_bp = Blueprint('user', __name__)

def require_auth():
    """Decorator to require authentication"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@user_bp.route('/', methods=['GET'])
def get_users():
    """Get all active users (public endpoint)"""
    try:
        role = request.args.get('role')
        verified_only = request.args.get('verified') == 'true'
        
        query = User.query.filter_by(is_active=True)
        
        if role:
            query = query.filter_by(role=role)
        
        if verified_only:
            query = query.filter_by(is_verified=True)
        
        users = query.order_by(User.created_at.desc()).limit(50).all()
        
        users_data = []
        for user in users:
            user_dict = {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'bio': user.bio,
                'location': user.location,
                'profile_image': user.profile_image,
                'is_verified': user.is_verified,
                'subscription_type': user.subscription_type,
                'created_at': user.created_at.isoformat() if user.created_at else None
            }
            users_data.append(user_dict)
        
        return jsonify({'users': users_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get public user profile"""
    try:
        user = User.query.filter_by(id=user_id, is_active=True).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's portfolio items
        portfolio_items = PortfolioItem.query.filter_by(user_id=user.id).order_by(PortfolioItem.order_index).all()
        
        user_dict = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'bio': user.bio,
            'location': user.location,
            'website': user.website,
            'profile_image': user.profile_image,
            'cover_image': user.cover_image,
            'is_verified': user.is_verified,
            'subscription_type': user.subscription_type,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'portfolio': [item.to_dict() for item in portfolio_items],
            'tags': [tag.to_dict() for tag in user.tags]
        }
        
        return jsonify(user_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user (admin only or self)"""
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        current_user_id = session['user_id']
        
        # Users can only update their own profile
        if current_user_id != user_id:
            return jsonify({'error': 'Not authorized to update this user'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'bio', 'location', 'phone', 'website', 'profile_image', 'cover_image']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Deactivate user account"""
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        current_user_id = session['user_id']
        
        # Users can only delete their own account
        if current_user_id != user_id:
            return jsonify({'error': 'Not authorized to delete this user'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Soft delete - just deactivate the account
        user.is_active = False
        db.session.commit()
        
        # Clear session
        session.clear()
        
        return jsonify({'message': 'Account deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/stats', methods=['GET'])
def get_user_stats():
    """Get platform statistics"""
    try:
        total_users = User.query.filter_by(is_active=True).count()
        freelancers = User.query.filter_by(role='freelancer', is_active=True).count()
        organisers = User.query.filter_by(role='organiser', is_active=True).count()
        venues = User.query.filter_by(role='venue', is_active=True).count()
        vendors = User.query.filter_by(role='vendor', is_active=True).count()
        collectives = User.query.filter_by(role='collective', is_active=True).count()
        verified_users = User.query.filter_by(is_verified=True, is_active=True).count()
        pro_users = User.query.filter_by(subscription_type='pro', is_active=True).count()
        
        stats = {
            'total_users': total_users,
            'user_roles': {
                'freelancers': freelancers,
                'organisers': organisers,
                'venues': venues,
                'vendors': vendors,
                'collectives': collectives
            },
            'verified_users': verified_users,
            'pro_users': pro_users
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
