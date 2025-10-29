from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, Message
from datetime import datetime
import uuid

message_bp = Blueprint('message', __name__)

def require_auth():
    """Decorator to require authentication"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@message_bp.route('/', methods=['POST'])
def send_message():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('recipient_id') or not data.get('content'):
            return jsonify({'error': 'Recipient ID and content are required'}), 400
        
        # Check if recipient exists
        recipient = User.query.get(data['recipient_id'])
        if not recipient:
            return jsonify({'error': 'Recipient not found'}), 404
        
        # Check if user is trying to message themselves
        if data['recipient_id'] == session['user_id']:
            return jsonify({'error': 'Cannot send message to yourself'}), 400
        
        # Generate thread ID if not provided
        thread_id = data.get('thread_id')
        if not thread_id:
            # Create new thread ID based on user IDs (sorted for consistency)
            user_ids = sorted([session['user_id'], data['recipient_id']])
            thread_id = f"thread_{user_ids[0]}_{user_ids[1]}_{uuid.uuid4().hex[:8]}"
        
        message = Message(
            sender_id=session['user_id'],
            recipient_id=data['recipient_id'],
            subject=data.get('subject', ''),
            content=data['content'],
            thread_id=thread_id
        )
        
        db.session.add(message)
        db.session.commit()
        
        message_dict = message.to_dict()
        message_dict['sender'] = message.sender.to_dict()
        message_dict['recipient'] = message.recipient.to_dict()
        
        return jsonify({
            'message': 'Message sent successfully',
            'data': message_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/', methods=['GET'])
def get_messages():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        message_type = request.args.get('type', 'all')  # all, sent, received
        thread_id = request.args.get('thread_id')
        
        query = Message.query
        
        if thread_id:
            # Get messages in a specific thread
            query = query.filter(
                (Message.thread_id == thread_id) &
                ((Message.sender_id == user_id) | (Message.recipient_id == user_id))
            )
        else:
            # Get all messages for user
            if message_type == 'sent':
                query = query.filter_by(sender_id=user_id)
            elif message_type == 'received':
                query = query.filter_by(recipient_id=user_id)
            else:
                query = query.filter((Message.sender_id == user_id) | (Message.recipient_id == user_id))
        
        messages = query.order_by(Message.created_at.desc()).all()
        
        messages_data = []
        for message in messages:
            message_dict = message.to_dict()
            message_dict['sender'] = message.sender.to_dict()
            message_dict['recipient'] = message.recipient.to_dict()
            messages_data.append(message_dict)
        
        return jsonify({'messages': messages_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/threads', methods=['GET'])
def get_message_threads():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        
        # Get all unique thread IDs for the user
        threads_query = db.session.query(Message.thread_id).filter(
            (Message.sender_id == user_id) | (Message.recipient_id == user_id)
        ).distinct()
        
        threads_data = []
        for thread_result in threads_query:
            thread_id = thread_result[0]
            
            # Get the latest message in this thread
            latest_message = Message.query.filter_by(thread_id=thread_id).order_by(Message.created_at.desc()).first()
            
            if latest_message:
                # Get the other participant in the thread
                other_user_id = latest_message.recipient_id if latest_message.sender_id == user_id else latest_message.sender_id
                other_user = User.query.get(other_user_id)
                
                # Count unread messages in this thread
                unread_count = Message.query.filter(
                    (Message.thread_id == thread_id) &
                    (Message.recipient_id == user_id) &
                    (Message.is_read == False)
                ).count()
                
                thread_data = {
                    'thread_id': thread_id,
                    'other_user': other_user.to_dict() if other_user else None,
                    'latest_message': latest_message.to_dict(),
                    'unread_count': unread_count
                }
                threads_data.append(thread_data)
        
        # Sort by latest message timestamp
        threads_data.sort(key=lambda x: x['latest_message']['created_at'], reverse=True)
        
        return jsonify({'threads': threads_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/<int:message_id>/read', methods=['PUT'])
def mark_message_read(message_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        message = Message.query.filter_by(id=message_id, recipient_id=user_id).first()
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        message.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Message marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/thread/<thread_id>/read', methods=['PUT'])
def mark_thread_read(thread_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        
        # Mark all unread messages in this thread as read
        Message.query.filter(
            (Message.thread_id == thread_id) &
            (Message.recipient_id == user_id) &
            (Message.is_read == False)
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({'message': 'Thread marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        message = Message.query.filter_by(id=message_id, sender_id=user_id).first()
        
        if not message:
            return jsonify({'error': 'Message not found or not authorized'}), 404
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/unread-count', methods=['GET'])
def get_unread_count():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        
        unread_count = Message.query.filter(
            (Message.recipient_id == user_id) &
            (Message.is_read == False)
        ).count()
        
        return jsonify({'unread_count': unread_count}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

