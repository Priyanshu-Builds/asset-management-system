from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='employee')
    department = db.Column(db.String(100), default='')
    status = db.Column(db.String(20), default='active')
    avatar = db.Column(db.String(255), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'status': self.status,
            'avatar': self.avatar,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Asset(db.Model):
    __tablename__ = 'assets'
    id = db.Column(db.Integer, primary_key=True)
    asset_name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), default='')
    model = db.Column(db.String(100), default='')
    serial_number = db.Column(db.String(100), unique=True)
    purchase_date = db.Column(db.Date, nullable=True)
    warranty_expiry = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(30), default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'asset_name': self.asset_name,
            'category': self.category,
            'brand': self.brand,
            'model': self.model,
            'serial_number': self.serial_number,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'warranty_expiry': self.warranty_expiry.isoformat() if self.warranty_expiry else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AssetAssignment(db.Model):
    __tablename__ = 'asset_assignments'
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    asset = db.relationship('Asset', backref='assignments')
    employee = db.relationship('User', backref='assignments')

    def to_dict(self):
        return {
            'id': self.id,
            'asset_id': self.asset_id,
            'employee_id': self.employee_id,
            'asset_name': self.asset.asset_name if self.asset else None,
            'asset_category': self.asset.category if self.asset else None,
            'employee_name': self.employee.name if self.employee else None,
            'employee_avatar': self.employee.avatar if self.employee else None,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Issue(db.Model):
    __tablename__ = 'issues'
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    issue_description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    asset = db.relationship('Asset', backref='issues')
    employee = db.relationship('User', backref='issues')

    def to_dict(self):
        return {
            'id': self.id,
            'asset_id': self.asset_id,
            'employee_id': self.employee_id,
            'asset_name': self.asset.asset_name if self.asset else None,
            'asset_category': self.asset.category if self.asset else None,
            'reported_by': self.employee.name if self.employee else None,
            'reporter_avatar': self.employee.avatar if self.employee else None,
            'issue_description': self.issue_description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MaintenanceRecord(db.Model):
    __tablename__ = 'maintenance_records'
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    maintenance_date = db.Column(db.Date, nullable=False)
    technician = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, default='')
    cost = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    asset = db.relationship('Asset', backref='maintenance_records')

    def to_dict(self):
        return {
            'id': self.id,
            'asset_id': self.asset_id,
            'asset_name': self.asset.asset_name if self.asset else None,
            'asset_category': self.asset.category if self.asset else None,
            'maintenance_date': self.maintenance_date.isoformat() if self.maintenance_date else None,
            'technician': self.technician,
            'description': self.description,
            'cost': self.cost,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(255), nullable=False)
    module = db.Column(db.String(50), default='')
    details = db.Column(db.Text, default='')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='activity_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'System',
            'user_avatar': self.user.avatar if self.user else None,
            'action': self.action,
            'module': self.module,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
