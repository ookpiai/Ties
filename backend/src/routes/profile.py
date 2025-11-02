from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, PortfolioItem, Tag, user_tags
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

def require_auth():
    """Decorator to require authentication"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@profile_bp.route('/', methods=['GET'])
def get_profile():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's portfolio items
        portfolio_items = PortfolioItem.query.filter_by(user_id=user.id).order_by(PortfolioItem.order_index).all()
        
        profile_data = user.to_dict()
        profile_data['portfolio'] = [item.to_dict() for item in portfolio_items]
        profile_data['tags'] = [tag.to_dict() for tag in user.tags]
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/', methods=['PUT'])
def update_profile():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'bio', 'location', 'phone', 'website', 'profile_image', 'cover_image']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/portfolio', methods=['POST'])
def add_portfolio_item():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        # Get the highest order index for this user
        max_order = db.session.query(db.func.max(PortfolioItem.order_index)).filter_by(user_id=session['user_id']).scalar() or 0
        
        portfolio_item = PortfolioItem(
            user_id=session['user_id'],
            title=data['title'],
            description=data.get('description', ''),
            media_type=data.get('media_type', 'image'),
            media_url=data.get('media_url', ''),
            thumbnail_url=data.get('thumbnail_url', ''),
            is_featured=data.get('is_featured', False),
            order_index=max_order + 1
        )
        
        db.session.add(portfolio_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Portfolio item added successfully',
            'item': portfolio_item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/portfolio/<int:item_id>', methods=['PUT'])
def update_portfolio_item(item_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        item = PortfolioItem.query.filter_by(id=item_id, user_id=session['user_id']).first()
        if not item:
            return jsonify({'error': 'Portfolio item not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'media_type', 'media_url', 'thumbnail_url', 'is_featured', 'order_index']
        for field in allowed_fields:
            if field in data:
                setattr(item, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Portfolio item updated successfully',
            'item': item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/portfolio/<int:item_id>', methods=['DELETE'])
def delete_portfolio_item(item_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        item = PortfolioItem.query.filter_by(id=item_id, user_id=session['user_id']).first()
        if not item:
            return jsonify({'error': 'Portfolio item not found'}), 404
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Portfolio item deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/tags', methods=['POST'])
def add_tag():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Tag name is required'}), 400
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if tag exists, create if not
        tag = Tag.query.filter_by(name=data['name'].lower()).first()
        if not tag:
            tag = Tag(
                name=data['name'].lower(),
                category=data.get('category', 'general')
            )
            db.session.add(tag)
        
        # Add tag to user if not already added
        if tag not in user.tags:
            user.tags.append(tag)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tag added successfully',
            'tag': tag.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/tags/<int:tag_id>', methods=['DELETE'])
def remove_tag(tag_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        tag = Tag.query.get(tag_id)
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404
        
        if tag in user.tags:
            user.tags.remove(tag)
            db.session.commit()
        
        return jsonify({'message': 'Tag removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/<int:user_id>', methods=['GET'])
def get_public_profile(user_id):
    """Get public profile of any user"""
    try:
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's portfolio items
        portfolio_items = PortfolioItem.query.filter_by(user_id=user.id).order_by(PortfolioItem.order_index).all()
        
        # Return public profile data (excluding sensitive information)
        profile_data = {
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
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

