from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, Booking
from datetime import datetime

booking_bp = Blueprint('booking', __name__)

def require_auth():
    """Decorator to require authentication"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@booking_bp.route('/', methods=['POST'])
def create_booking():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['freelancer_id', 'title', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if freelancer exists
        freelancer = User.query.get(data['freelancer_id'])
        if not freelancer:
            return jsonify({'error': 'Freelancer not found'}), 404
        
        # Check if user is trying to book themselves
        if data['freelancer_id'] == session['user_id']:
            return jsonify({'error': 'Cannot book yourself'}), 400
        
        # Get client's subscription type for commission rate
        client = User.query.get(session['user_id'])
        commission_rate = 0.08 if client.subscription_type == 'pro' else 0.10
        
        booking = Booking(
            client_id=session['user_id'],
            freelancer_id=data['freelancer_id'],
            title=data['title'],
            description=data['description'],
            budget=data.get('budget'),
            currency=data.get('currency', 'AUD'),
            start_date=datetime.fromisoformat(data['start_date']) if data.get('start_date') else None,
            end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None,
            location=data.get('location', ''),
            commission_rate=commission_rate
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/', methods=['GET'])
def get_bookings():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        booking_type = request.args.get('type', 'all')  # all, sent, received
        status = request.args.get('status')
        
        query = Booking.query
        
        if booking_type == 'sent':
            query = query.filter_by(client_id=user_id)
        elif booking_type == 'received':
            query = query.filter_by(freelancer_id=user_id)
        else:
            query = query.filter((Booking.client_id == user_id) | (Booking.freelancer_id == user_id))
        
        if status:
            query = query.filter_by(status=status)
        
        bookings = query.order_by(Booking.created_at.desc()).all()
        
        # Include client and freelancer info
        booking_data = []
        for booking in bookings:
            booking_dict = booking.to_dict()
            booking_dict['client'] = booking.client.to_dict()
            booking_dict['freelancer'] = booking.freelancer.to_dict()
            booking_data.append(booking_dict)
        
        return jsonify({'bookings': booking_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        booking = Booking.query.filter(
            (Booking.id == booking_id) &
            ((Booking.client_id == user_id) | (Booking.freelancer_id == user_id))
        ).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        booking_dict = booking.to_dict()
        booking_dict['client'] = booking.client.to_dict()
        booking_dict['freelancer'] = booking.freelancer.to_dict()
        
        return jsonify(booking_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['pending', 'accepted', 'declined', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        user_id = session['user_id']
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check permissions
        if new_status in ['accepted', 'declined'] and booking.freelancer_id != user_id:
            return jsonify({'error': 'Only freelancer can accept/decline bookings'}), 403
        
        if new_status in ['completed', 'cancelled'] and booking.client_id != user_id and booking.freelancer_id != user_id:
            return jsonify({'error': 'Only client or freelancer can complete/cancel bookings'}), 403
        
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Booking status updated successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        booking = Booking.query.filter_by(id=booking_id, client_id=user_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found or not authorized'}), 404
        
        if booking.status != 'pending':
            return jsonify({'error': 'Can only edit pending bookings'}), 400
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'budget', 'currency', 'start_date', 'end_date', 'location']
        for field in allowed_fields:
            if field in data:
                if field in ['start_date', 'end_date'] and data[field]:
                    setattr(booking, field, datetime.fromisoformat(data[field]))
                else:
                    setattr(booking, field, data[field])
        
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Booking updated successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        booking = Booking.query.filter_by(id=booking_id, client_id=user_id).first()
        
        if not booking:
            return jsonify({'error': 'Booking not found or not authorized'}), 404
        
        if booking.status not in ['pending', 'declined']:
            return jsonify({'error': 'Can only delete pending or declined bookings'}), 400
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({'message': 'Booking deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/jobs', methods=['GET'])
def get_jobs_board():
    """Get public jobs board for freelancers to browse"""
    try:
        # Get all pending bookings that are public (jobs board)
        # For now, we'll show all pending bookings
        bookings = Booking.query.filter_by(status='pending').order_by(Booking.created_at.desc()).all()
        
        jobs_data = []
        for booking in bookings:
            job_dict = booking.to_dict()
            # Include client info but hide sensitive data
            job_dict['client'] = {
                'id': booking.client.id,
                'username': booking.client.username,
                'role': booking.client.role,
                'location': booking.client.location,
                'is_verified': booking.client.is_verified
            }
            jobs_data.append(job_dict)
        
        return jsonify({'jobs': jobs_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

