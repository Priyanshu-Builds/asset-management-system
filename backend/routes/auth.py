from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_bcrypt import Bcrypt
from models import db, User

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    department = data.get('department', '')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name=name, email=email, password=hashed, role='employee', department=department, status='active')
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Registration successful! You can now login.', 'user': user.to_dict()}), 201


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.status != 'active':
        return jsonify({'error': 'Account is disabled. Contact admin.'}), 403

    token = create_access_token(identity=str(user.id), additional_claims={
        'role': user.role,
        'name': user.name,
        'email': user.email
    })

    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'No account found with this email'}), 404

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password reset successful! You can now login with your new password.'}), 200
