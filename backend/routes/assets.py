from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Asset, ActivityLog

assets_bp = Blueprint('assets', __name__)


def require_admin_or_it():
    claims = get_jwt()
    return claims.get('role') in ['admin', 'it_manager']


@assets_bp.route('/assets', methods=['GET'])
@jwt_required()
def get_assets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    status_filter = request.args.get('status', '')

    query = Asset.query

    if search:
        query = query.filter(
            db.or_(
                Asset.asset_name.ilike(f'%{search}%'),
                Asset.serial_number.ilike(f'%{search}%'),
                Asset.brand.ilike(f'%{search}%')
            )
        )

    if status_filter:
        query = query.filter(Asset.status == status_filter)

    pagination = query.order_by(Asset.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'assets': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@assets_bp.route('/assets/<int:asset_id>', methods=['GET'])
@jwt_required()
def get_asset(asset_id):
    asset = Asset.query.get_or_404(asset_id)
    return jsonify(asset.to_dict())


@assets_bp.route('/assets', methods=['POST'])
@jwt_required()
def create_asset():
    if not require_admin_or_it():
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    data = request.get_json()
    asset = Asset(
        asset_name=data.get('asset_name'),
        category=data.get('category'),
        brand=data.get('brand', ''),
        model=data.get('model', ''),
        serial_number=data.get('serial_number'),
        purchase_date=data.get('purchase_date'),
        warranty_expiry=data.get('warranty_expiry'),
        status=data.get('status', 'available')
    )
    db.session.add(asset)

    log = ActivityLog(user_id=int(get_jwt()['sub']), action=f'Created asset: {asset.asset_name}', module='Assets')
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Asset created', 'asset': asset.to_dict()}), 201


@assets_bp.route('/assets/<int:asset_id>', methods=['PUT'])
@jwt_required()
def update_asset(asset_id):
    if not require_admin_or_it():
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    asset = Asset.query.get_or_404(asset_id)
    data = request.get_json()

    asset.asset_name = data.get('asset_name', asset.asset_name)
    asset.category = data.get('category', asset.category)
    asset.brand = data.get('brand', asset.brand)
    asset.model = data.get('model', asset.model)
    asset.serial_number = data.get('serial_number', asset.serial_number)
    asset.purchase_date = data.get('purchase_date', asset.purchase_date)
    asset.warranty_expiry = data.get('warranty_expiry', asset.warranty_expiry)
    asset.status = data.get('status', asset.status)

    log = ActivityLog(user_id=int(get_jwt()['sub']), action=f'Updated asset: {asset.asset_name}', module='Assets')
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Asset updated', 'asset': asset.to_dict()})


@assets_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
@jwt_required()
def delete_asset(asset_id):
    if not require_admin_or_it():
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    asset = Asset.query.get_or_404(asset_id)
    asset_name = asset.asset_name

    log = ActivityLog(user_id=int(get_jwt()['sub']), action=f'Deleted asset: {asset_name}', module='Assets')
    db.session.add(log)

    db.session.delete(asset)
    db.session.commit()

    return jsonify({'message': 'Asset deleted'})


@assets_bp.route('/assets/all', methods=['GET'])
@jwt_required()
def get_all_assets():
    assets = Asset.query.all()
    return jsonify([a.to_dict() for a in assets])
