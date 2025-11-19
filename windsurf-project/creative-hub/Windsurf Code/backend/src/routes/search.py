from flask import Blueprint, request, jsonify
from src.models.user import db, User, Tag, PortfolioItem, Booking
from sqlalchemy import or_, and_

search_bp = Blueprint('search', __name__)

@search_bp.route('/users', methods=['GET'])
def search_users():
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        role = request.args.get('role')
        location = request.args.get('location')
        tags = request.args.get('tags', '').split(',') if request.args.get('tags') else []
        verified_only = request.args.get('verified') == 'true'
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Start with base query for active users
        users_query = User.query.filter_by(is_active=True)
        
        # Apply filters
        if query:
            users_query = users_query.filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.first_name.ilike(f'%{query}%'),
                    User.last_name.ilike(f'%{query}%'),
                    User.bio.ilike(f'%{query}%')
                )
            )
        
        if role:
            users_query = users_query.filter_by(role=role)
        
        if location:
            users_query = users_query.filter(User.location.ilike(f'%{location}%'))
        
        if verified_only:
            users_query = users_query.filter_by(is_verified=True)
        
        if tags:
            # Filter by tags
            tag_objects = Tag.query.filter(Tag.name.in_([tag.lower().strip() for tag in tags])).all()
            if tag_objects:
                for tag in tag_objects:
                    users_query = users_query.filter(User.tags.contains(tag))
        
        # Order by subscription type (Pro users first), then by verification, then by creation date
        users_query = users_query.order_by(
            User.subscription_type.desc(),
            User.is_verified.desc(),
            User.created_at.desc()
        )
        
        # Paginate results
        paginated_users = users_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        users_data = []
        for user in paginated_users.items:
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
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'tags': [tag.to_dict() for tag in user.tags]
            }
            
            # Add featured portfolio items
            featured_items = PortfolioItem.query.filter_by(
                user_id=user.id, 
                is_featured=True
            ).order_by(PortfolioItem.order_index).limit(3).all()
            user_dict['featured_portfolio'] = [item.to_dict() for item in featured_items]
            
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_users.total,
                'pages': paginated_users.pages,
                'has_next': paginated_users.has_next,
                'has_prev': paginated_users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/tags', methods=['GET'])
def search_tags():
    try:
        query = request.args.get('q', '').strip()
        category = request.args.get('category')
        
        tags_query = Tag.query
        
        if query:
            tags_query = tags_query.filter(Tag.name.ilike(f'%{query}%'))
        
        if category:
            tags_query = tags_query.filter_by(category=category)
        
        tags = tags_query.order_by(Tag.name).limit(50).all()
        
        return jsonify({
            'tags': [tag.to_dict() for tag in tags]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/jobs', methods=['GET'])
def search_jobs():
    try:
        # Get search parameters
        query = request.args.get('q', '').strip()
        location = request.args.get('location')
        budget_min = request.args.get('budget_min', type=float)
        budget_max = request.args.get('budget_max', type=float)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Start with pending bookings (jobs board)
        jobs_query = Booking.query.filter_by(status='pending')
        
        # Apply filters
        if query:
            jobs_query = jobs_query.filter(
                or_(
                    Booking.title.ilike(f'%{query}%'),
                    Booking.description.ilike(f'%{query}%')
                )
            )
        
        if location:
            jobs_query = jobs_query.filter(Booking.location.ilike(f'%{location}%'))
        
        if budget_min is not None:
            jobs_query = jobs_query.filter(Booking.budget >= budget_min)
        
        if budget_max is not None:
            jobs_query = jobs_query.filter(Booking.budget <= budget_max)
        
        # Order by creation date (newest first)
        jobs_query = jobs_query.order_by(Booking.created_at.desc())
        
        # Paginate results
        paginated_jobs = jobs_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        jobs_data = []
        for job in paginated_jobs.items:
            job_dict = job.to_dict()
            # Include client info but hide sensitive data
            job_dict['client'] = {
                'id': job.client.id,
                'username': job.client.username,
                'role': job.client.role,
                'location': job.client.location,
                'is_verified': job.client.is_verified,
                'profile_image': job.client.profile_image
            }
            jobs_data.append(job_dict)
        
        return jsonify({
            'jobs': jobs_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_jobs.total,
                'pages': paginated_jobs.pages,
                'has_next': paginated_jobs.has_next,
                'has_prev': paginated_jobs.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/discover', methods=['GET'])
def discover_feed():
    """Get a curated discovery feed of users and jobs"""
    try:
        feed_type = request.args.get('type', 'mixed')  # mixed, users, jobs
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        feed_data = []
        
        if feed_type in ['mixed', 'users']:
            # Get featured users (Pro subscribers, verified users, recent joiners)
            featured_users = User.query.filter_by(is_active=True).order_by(
                User.subscription_type.desc(),
                User.is_verified.desc(),
                User.created_at.desc()
            ).limit(per_page // 2 if feed_type == 'mixed' else per_page).all()
            
            for user in featured_users:
                user_dict = {
                    'type': 'user',
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
                    'tags': [tag.to_dict() for tag in user.tags[:5]]  # Limit tags
                }
                
                # Add one featured portfolio item
                featured_item = PortfolioItem.query.filter_by(
                    user_id=user.id, 
                    is_featured=True
                ).first()
                if featured_item:
                    user_dict['featured_item'] = featured_item.to_dict()
                
                feed_data.append(user_dict)
        
        if feed_type in ['mixed', 'jobs']:
            # Get recent jobs
            recent_jobs = Booking.query.filter_by(status='pending').order_by(
                Booking.created_at.desc()
            ).limit(per_page // 2 if feed_type == 'mixed' else per_page).all()
            
            for job in recent_jobs:
                job_dict = {
                    'type': 'job',
                    'id': job.id,
                    'title': job.title,
                    'description': job.description[:200] + '...' if len(job.description) > 200 else job.description,
                    'budget': job.budget,
                    'currency': job.currency,
                    'location': job.location,
                    'created_at': job.created_at.isoformat() if job.created_at else None,
                    'client': {
                        'id': job.client.id,
                        'username': job.client.username,
                        'role': job.client.role,
                        'is_verified': job.client.is_verified,
                        'profile_image': job.client.profile_image
                    }
                }
                feed_data.append(job_dict)
        
        # Mix and sort by creation date if mixed feed
        if feed_type == 'mixed':
            feed_data.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({
            'feed': feed_data,
            'page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """Get search suggestions for autocomplete"""
    try:
        query = request.args.get('q', '').strip()
        suggestion_type = request.args.get('type', 'all')  # all, users, tags, locations
        
        suggestions = []
        
        if suggestion_type in ['all', 'users'] and query:
            # User suggestions
            users = User.query.filter(
                and_(
                    User.is_active == True,
                    or_(
                        User.username.ilike(f'%{query}%'),
                        User.first_name.ilike(f'%{query}%'),
                        User.last_name.ilike(f'%{query}%')
                    )
                )
            ).limit(5).all()
            
            for user in users:
                suggestions.append({
                    'type': 'user',
                    'value': user.username,
                    'label': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'role': user.role,
                    'id': user.id
                })
        
        if suggestion_type in ['all', 'tags'] and query:
            # Tag suggestions
            tags = Tag.query.filter(Tag.name.ilike(f'%{query}%')).limit(5).all()
            
            for tag in tags:
                suggestions.append({
                    'type': 'tag',
                    'value': tag.name,
                    'label': tag.name,
                    'category': tag.category,
                    'id': tag.id
                })
        
        if suggestion_type in ['all', 'locations'] and query:
            # Location suggestions (from existing user locations)
            locations = db.session.query(User.location).filter(
                and_(
                    User.location.isnot(None),
                    User.location != '',
                    User.location.ilike(f'%{query}%')
                )
            ).distinct().limit(5).all()
            
            for location in locations:
                suggestions.append({
                    'type': 'location',
                    'value': location[0],
                    'label': location[0]
                })
        
        return jsonify({'suggestions': suggestions}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

