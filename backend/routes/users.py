from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from flask_bcrypt import Bcrypt
from models import db, User, ActivityLog

users_bp = Blueprint('users', __name__)
bcrypt = Bcrypt()


def require_admin():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return False
    return True


@users_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if not require_admin():
        return jsonify({'error': 'Admin access required'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    query = User.query
    if search:
        query = query.filter(
            db.or_(
                User.name.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%')
            )
        )

    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@users_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@users_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    if not require_admin():
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password', 'password123')
    role = data.get('role', 'employee')
    department = data.get('department', '')

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name=name, email=email, password=hashed, role=role, department=department)
    db.session.add(user)

    claims = get_jwt()
    log = ActivityLog(user_id=int(get_jwt()['sub']), action=f'Created user: {name}', module='Users')
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'User created', 'user': user.to_dict()}), 201


@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if not require_admin():
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()

    user.name = data.get('name', user.name)
    user.role = data.get('role', user.role)
    user.department = data.get('department', user.department)
    user.status = data.get('status', user.status)

    if data.get('email'):
        user.email = data['email']

    log = ActivityLog(user_id=int(get_jwt()['sub']), action=f'Updated user: {user.name}', module='Users')
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'User updated', 'user': user.to_dict()})


@users_bp.route('/users/<int:user_id>/toggle-status', methods=['PATCH'])
@jwt_required()
def toggle_user_status(user_id):
    if not require_admin():
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    user.status = 'disabled' if user.status == 'active' else 'active'

    log = ActivityLog(user_id=int(get_jwt()['sub']), action=f'{"Disabled" if user.status == "disabled" else "Enabled"} user: {user.name}', module='Users')
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': f'User {"disabled" if user.status == "disabled" else "enabled"}', 'user': user.to_dict()})


@users_bp.route('/users/avatar', methods=['PATCH'])
@jwt_required()
def update_avatar():
    claims = get_jwt()
    user_id = int(claims['sub'])
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    avatar_index = data.get('avatar_index')
    if avatar_index is not None:
        user.avatar = str(avatar_index)
        db.session.commit()
    return jsonify({'message': 'Avatar updated', 'user': user.to_dict()})


@users_bp.route('/users/employees', methods=['GET'])
@jwt_required()
def get_employees():
    employees = User.query.filter_by(status='active').all()
    return jsonify([u.to_dict() for u in employees])
