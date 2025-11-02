from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Association tables for many-to-many relationships
user_tags = db.Table('user_tags',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

project_collaborators = db.Table('project_collaborators',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # User role: freelancer, vendor, venue, collective, organiser
    role = db.Column(db.String(20), nullable=False)
    
    # Profile information
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    
    # Profile media
    profile_image = db.Column(db.String(255))
    cover_image = db.Column(db.String(255))
    
    # Enhanced profile fields for MVP
    company_name = db.Column(db.String(100))  # For vendors, venues, collectives
    business_type = db.Column(db.String(50))  # Type of business/service
    years_experience = db.Column(db.Integer)
    hourly_rate = db.Column(db.Float)
    daily_rate = db.Column(db.Float)
    project_rate = db.Column(db.Float)
    currency = db.Column(db.String(3), default='AUD')
    
    # Availability and preferences
    availability_status = db.Column(db.String(20), default='available')  # available, busy, unavailable
    timezone = db.Column(db.String(50))
    preferred_project_types = db.Column(db.Text)  # JSON array of project types
    travel_radius = db.Column(db.Integer)  # km willing to travel
    remote_work = db.Column(db.Boolean, default=True)
    
    # Verification and credentials
    verification_status = db.Column(db.String(20), default='unverified')  # unverified, pending, verified
    verification_documents = db.Column(db.Text)  # JSON array of document URLs
    professional_credentials = db.Column(db.Text)  # JSON array of credentials
    insurance_verified = db.Column(db.Boolean, default=False)
    background_check = db.Column(db.Boolean, default=False)
    
    # Social and portfolio links
    instagram_url = db.Column(db.String(200))
    linkedin_url = db.Column(db.String(200))
    behance_url = db.Column(db.String(200))
    youtube_url = db.Column(db.String(200))
    tiktok_url = db.Column(db.String(200))
    
    # Subscription and status
    subscription_type = db.Column(db.String(20), default='free')  # free, pro, studio_pro
    subscription_expires = db.Column(db.DateTime)
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Onboarding and profile completion
    onboarding_completed = db.Column(db.Boolean, default=False)
    profile_completion_score = db.Column(db.Integer, default=0)  # 0-100
    last_profile_update = db.Column(db.DateTime)
    
    # Performance metrics
    total_bookings = db.Column(db.Integer, default=0)
    completed_projects = db.Column(db.Integer, default=0)
    average_rating = db.Column(db.Float, default=0.0)
    response_time_hours = db.Column(db.Float, default=24.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    tags = db.relationship('Tag', secondary=user_tags, backref='users')
    portfolio_items = db.relationship('PortfolioItem', backref='user', lazy=True)
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.recipient_id', backref='recipient', lazy=True)
    bookings_made = db.relationship('Booking', foreign_keys='Booking.client_id', backref='client', lazy=True)
    bookings_received = db.relationship('Booking', foreign_keys='Booking.freelancer_id', backref='freelancer', lazy=True)
    projects_owned = db.relationship('Project', foreign_keys='Project.owner_id', backref='owner', lazy=True)
    projects_collaborated = db.relationship('Project', secondary=project_collaborators, backref='collaborators')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'location': self.location,
            'phone': self.phone,
            'website': self.website,
            'profile_image': self.profile_image,
            'cover_image': self.cover_image,
            
            # Enhanced profile fields
            'company_name': self.company_name,
            'business_type': self.business_type,
            'years_experience': self.years_experience,
            'hourly_rate': self.hourly_rate,
            'daily_rate': self.daily_rate,
            'project_rate': self.project_rate,
            'currency': self.currency,
            
            # Availability and preferences
            'availability_status': self.availability_status,
            'timezone': self.timezone,
            'preferred_project_types': self.preferred_project_types,
            'travel_radius': self.travel_radius,
            'remote_work': self.remote_work,
            
            # Verification and credentials
            'verification_status': self.verification_status,
            'verification_documents': self.verification_documents,
            'professional_credentials': self.professional_credentials,
            'insurance_verified': self.insurance_verified,
            'background_check': self.background_check,
            
            # Social links
            'instagram_url': self.instagram_url,
            'linkedin_url': self.linkedin_url,
            'behance_url': self.behance_url,
            'youtube_url': self.youtube_url,
            'tiktok_url': self.tiktok_url,
            
            # Subscription and status
            'subscription_type': self.subscription_type,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            
            # Onboarding and completion
            'onboarding_completed': self.onboarding_completed,
            'profile_completion_score': self.profile_completion_score,
            'last_profile_update': self.last_profile_update.isoformat() if self.last_profile_update else None,
            
            # Performance metrics
            'total_bookings': self.total_bookings,
            'completed_projects': self.completed_projects,
            'average_rating': self.average_rating,
            'response_time_hours': self.response_time_hours,
            
            # Timestamps
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    category = db.Column(db.String(30))  # skill, service, genre, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category
        }

class PortfolioItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    media_type = db.Column(db.String(20))  # image, video, audio, document
    media_url = db.Column(db.String(255))
    thumbnail_url = db.Column(db.String(255))
    is_featured = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'media_type': self.media_type,
            'media_url': self.media_url,
            'thumbnail_url': self.thumbnail_url,
            'is_featured': self.is_featured,
            'order_index': self.order_index,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    thread_id = db.Column(db.String(100))  # For grouping related messages
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'subject': self.subject,
            'content': self.content,
            'is_read': self.is_read,
            'thread_id': self.thread_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    budget = db.Column(db.Float)
    currency = db.Column(db.String(3), default='AUD')
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    location = db.Column(db.String(200))
    status = db.Column(db.String(20), default='pending')  # pending, accepted, declined, completed, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, released
    commission_rate = db.Column(db.Float, default=0.10)  # 10% default, 8% for Pro users
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'freelancer_id': self.freelancer_id,
            'title': self.title,
            'description': self.description,
            'budget': self.budget,
            'currency': self.currency,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'location': self.location,
            'status': self.status,
            'payment_status': self.payment_status,
            'commission_rate': self.commission_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    project_type = db.Column(db.String(50))  # event, campaign, production, etc.
    status = db.Column(db.String(20), default='planning')  # planning, active, completed, cancelled
    budget = db.Column(db.Float)
    currency = db.Column(db.String(3), default='AUD')
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    location = db.Column(db.String(200))
    is_public = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tasks = db.relationship('Task', backref='project', lazy=True)
    files = db.relationship('ProjectFile', backref='project', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'title': self.title,
            'description': self.description,
            'project_type': self.project_type,
            'status': self.status,
            'budget': self.budget,
            'currency': self.currency,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'location': self.location,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='todo')  # todo, in_progress, completed
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'assigned_to': self.assigned_to,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ProjectFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(50))
    file_url = db.Column(db.String(255), nullable=False)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'uploaded_by': self.uploaded_by,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'file_url': self.file_url,
            'version': self.version,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
