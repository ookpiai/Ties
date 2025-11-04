import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')

def require_auth(f):
    """
    Decorator to protect routes that require authentication.
    Validates Supabase JWT token from Authorization header.

    Usage:
        @app.route('/api/protected')
        @require_auth
        def protected_route():
            user_id = g.user_id  # Access authenticated user's ID
            return jsonify({'message': 'Success'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401

        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401

        # Validate JWT token
        try:
            # Decode the JWT using Supabase secret
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={'verify_aud': False}  # Supabase uses different audience
            )

            # Extract user information from JWT
            g.user_id = payload.get('sub')  # Supabase user ID
            g.user_email = payload.get('email')
            g.user_role = payload.get('role')

            if not g.user_id:
                return jsonify({'error': 'Invalid token payload'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            return jsonify({'error': f'Authentication failed: {str(e)}'}), 401

        # Call the protected route
        return f(*args, **kwargs)

    return decorated_function


def get_current_user():
    """
    Helper function to get current authenticated user's info from g object.
    Can only be called inside a route protected by @require_auth.

    Returns:
        dict: User information (user_id, email, role)
    """
    return {
        'user_id': getattr(g, 'user_id', None),
        'email': getattr(g, 'user_email', None),
        'role': getattr(g, 'user_role', None)
    }
