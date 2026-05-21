from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, AssetAssignment, Asset, ActivityLog
from datetime import date

assignments_bp = Blueprint('assignments', __name__)


def require_admin_or_it():
    claims = get_jwt()
    return claims.get('role') in ['admin', 'it_manager']


@assignments_bp.route('/assignments', methods=['GET'])
@jwt_required()
def get_assignments():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    claims = get_jwt()
    query = AssetAssignment.query

    if claims.get('role') == 'employee':
        query = query.filter_by(employee_id=int(claims['sub']))

    pagination = query.order_by(AssetAssignment.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'assignments': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@assignments_bp.route('/assignments', methods=['POST'])
@jwt_required()
def create_assignment():
    if not require_admin_or_it():
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    data = request.get_json()
    asset_id = data.get('asset_id')
    employee_id = data.get('employee_id')
    assigned_date = data.get('assigned_date', date.today().isoformat())
    return_date = data.get('return_date')

    asset = Asset.query.get_or_404(asset_id)

    if asset.status == 'assigned':
        return jsonify({'error': 'Asset is already assigned'}), 400

    assignment = AssetAssignment(
        asset_id=asset_id,
        employee_id=employee_id,
        assigned_date=assigned_date,
        return_date=return_date
    )
    asset.status = 'assigned'

    db.session.add(assignment)

    log = ActivityLog(
        user_id=int(get_jwt()['sub']),
        action=f'Assigned asset "{asset.asset_name}" to employee #{employee_id}',
        module='Assignments'
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Asset assigned', 'assignment': assignment.to_dict()}), 201


@assignments_bp.route('/assignments/<int:assignment_id>/return', methods=['PATCH'])
@jwt_required()
def return_assignment(assignment_id):
    if not require_admin_or_it():
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    assignment = AssetAssignment.query.get_or_404(assignment_id)
    assignment.status = 'returned'
    assignment.return_date = date.today()

    asset = Asset.query.get(assignment.asset_id)
    if asset:
        asset.status = 'available'

    log = ActivityLog(
        user_id=int(get_jwt()['sub']),
        action=f'Returned asset "{asset.asset_name}"',
        module='Assignments'
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Asset returned', 'assignment': assignment.to_dict()})


@assignments_bp.route('/assignments/my-assets', methods=['GET'])
@jwt_required()
def my_assets():
    claims = get_jwt()
    user_id = int(claims['sub'])
    assignments = AssetAssignment.query.filter_by(employee_id=user_id, status='active').all()
    return jsonify([a.to_dict() for a in assignments])
