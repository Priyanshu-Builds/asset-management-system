from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, MaintenanceRecord, Asset, ActivityLog

maintenance_bp = Blueprint('maintenance', __name__)


@maintenance_bp.route('/maintenance', methods=['GET'])
@jwt_required()
def get_maintenance():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = MaintenanceRecord.query.order_by(
        MaintenanceRecord.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'records': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@maintenance_bp.route('/maintenance', methods=['POST'])
@jwt_required()
def create_maintenance():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'it_manager']:
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    data = request.get_json()
    asset_id = data.get('asset_id')

    asset = Asset.query.get_or_404(asset_id)
    asset.status = 'under_maintenance'

    record = MaintenanceRecord(
        asset_id=asset_id,
        maintenance_date=data.get('maintenance_date'),
        technician=data.get('technician'),
        description=data.get('description', ''),
        cost=data.get('cost', 0.0)
    )
    db.session.add(record)

    log = ActivityLog(
        user_id=int(claims['sub']),
        action=f'Maintenance scheduled for asset "{asset.asset_name}"',
        module='Maintenance'
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Maintenance record created', 'record': record.to_dict()}), 201


@maintenance_bp.route('/maintenance/<int:record_id>/complete', methods=['PATCH'])
@jwt_required()
def complete_maintenance(record_id):
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'it_manager']:
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    record = MaintenanceRecord.query.get_or_404(record_id)
    asset = Asset.query.get(record.asset_id)
    if asset:
        asset.status = 'available'

    log = ActivityLog(
        user_id=int(claims['sub']),
        action=f'Maintenance completed for asset "{asset.asset_name}"',
        module='Maintenance'
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Maintenance completed', 'record': record.to_dict()})
