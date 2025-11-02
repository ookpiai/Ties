from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, Project, Task, ProjectFile
from datetime import datetime

project_bp = Blueprint('project', __name__)

def require_auth():
    """Decorator to require authentication"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@project_bp.route('/', methods=['POST'])
def create_project():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        project = Project(
            owner_id=session['user_id'],
            title=data['title'],
            description=data.get('description', ''),
            project_type=data.get('project_type', 'event'),
            budget=data.get('budget'),
            currency=data.get('currency', 'AUD'),
            start_date=datetime.fromisoformat(data['start_date']) if data.get('start_date') else None,
            end_date=datetime.fromisoformat(data['end_date']) if data.get('end_date') else None,
            location=data.get('location', ''),
            is_public=data.get('is_public', False)
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'message': 'Project created successfully',
            'project': project.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/', methods=['GET'])
def get_projects():
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        
        # Get projects owned by user or where user is a collaborator
        owned_projects = Project.query.filter_by(owner_id=user_id).all()
        
        # Get projects where user is a collaborator
        user = User.query.get(user_id)
        collaborated_projects = user.projects_collaborated
        
        # Combine and deduplicate
        all_projects = list(owned_projects) + [p for p in collaborated_projects if p not in owned_projects]
        
        projects_data = []
        for project in all_projects:
            project_dict = project.to_dict()
            project_dict['owner'] = project.owner.to_dict()
            project_dict['is_owner'] = project.owner_id == user_id
            project_dict['task_count'] = len(project.tasks)
            project_dict['file_count'] = len(project.files)
            projects_data.append(project_dict)
        
        return jsonify({'projects': projects_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user has access to this project
        user = User.query.get(user_id)
        if project.owner_id != user_id and project not in user.projects_collaborated:
            return jsonify({'error': 'Access denied'}), 403
        
        project_dict = project.to_dict()
        project_dict['owner'] = project.owner.to_dict()
        project_dict['is_owner'] = project.owner_id == user_id
        project_dict['collaborators'] = [collab.to_dict() for collab in project.collaborators]
        project_dict['tasks'] = [task.to_dict() for task in project.tasks]
        project_dict['files'] = [file.to_dict() for file in project.files]
        
        return jsonify(project_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        project = Project.query.filter_by(id=project_id, owner_id=user_id).first()
        
        if not project:
            return jsonify({'error': 'Project not found or not authorized'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'project_type', 'status', 'budget', 'currency', 'start_date', 'end_date', 'location', 'is_public']
        for field in allowed_fields:
            if field in data:
                if field in ['start_date', 'end_date'] and data[field]:
                    setattr(project, field, datetime.fromisoformat(data[field]))
                else:
                    setattr(project, field, data[field])
        
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Project updated successfully',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/collaborators', methods=['POST'])
def add_collaborator(project_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        project = Project.query.filter_by(id=project_id, owner_id=user_id).first()
        
        if not project:
            return jsonify({'error': 'Project not found or not authorized'}), 404
        
        data = request.get_json()
        collaborator_id = data.get('user_id')
        
        if not collaborator_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        collaborator = User.query.get(collaborator_id)
        if not collaborator:
            return jsonify({'error': 'User not found'}), 404
        
        if collaborator in project.collaborators:
            return jsonify({'error': 'User is already a collaborator'}), 400
        
        project.collaborators.append(collaborator)
        db.session.commit()
        
        return jsonify({
            'message': 'Collaborator added successfully',
            'collaborator': collaborator.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/collaborators/<int:user_id>', methods=['DELETE'])
def remove_collaborator(project_id, user_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        current_user_id = session['user_id']
        project = Project.query.filter_by(id=project_id, owner_id=current_user_id).first()
        
        if not project:
            return jsonify({'error': 'Project not found or not authorized'}), 404
        
        collaborator = User.query.get(user_id)
        if not collaborator:
            return jsonify({'error': 'User not found'}), 404
        
        if collaborator in project.collaborators:
            project.collaborators.remove(collaborator)
            db.session.commit()
        
        return jsonify({'message': 'Collaborator removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/tasks', methods=['POST'])
def create_task(project_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user has access to this project
        user = User.query.get(user_id)
        if project.owner_id != user_id and project not in user.projects_collaborated:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        
        task = Task(
            project_id=project_id,
            title=data['title'],
            description=data.get('description', ''),
            assigned_to=data.get('assigned_to'),
            priority=data.get('priority', 'medium'),
            due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user has access to this project
        user = User.query.get(user_id)
        if project.owner_id != user_id and project not in user.projects_collaborated:
            return jsonify({'error': 'Access denied'}), 403
        
        task = Task.query.filter_by(id=task_id, project_id=project_id).first()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date']
        for field in allowed_fields:
            if field in data:
                if field == 'due_date' and data[field]:
                    setattr(task, field, datetime.fromisoformat(data[field]))
                else:
                    setattr(task, field, data[field])
        
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Task updated successfully',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(project_id, task_id):
    auth_check = require_auth()
    if auth_check:
        return auth_check
    
    try:
        user_id = session['user_id']
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user has access to this project
        user = User.query.get(user_id)
        if project.owner_id != user_id and project not in user.projects_collaborated:
            return jsonify({'error': 'Access denied'}), 403
        
        task = Task.query.filter_by(id=task_id, project_id=project_id).first()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

