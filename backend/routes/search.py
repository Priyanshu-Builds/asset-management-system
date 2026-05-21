from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Asset, User, Issue

search_bp = Blueprint('search', __name__)


@search_bp.route('/search', methods=['GET'])
@jwt_required()
def global_search():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'assets': [], 'users': [], 'issues': []})

    assets = Asset.query.filter(
        db.or_(
            Asset.asset_name.ilike(f'%{q}%'),
            Asset.serial_number.ilike(f'%{q}%'),
            Asset.brand.ilike(f'%{q}%'),
            Asset.category.ilike(f'%{q}%')
        )
    ).limit(5).all()

    users = User.query.filter(
        db.or_(
            User.name.ilike(f'%{q}%'),
            User.email.ilike(f'%{q}%'),
            User.department.ilike(f'%{q}%')
        )
    ).limit(5).all()

    issues = Issue.query.join(Asset).join(User, Issue.employee_id == User.id).filter(
        db.or_(
            Issue.issue_description.ilike(f'%{q}%'),
            Asset.asset_name.ilike(f'%{q}%')
        )
    ).limit(5).all()

    return jsonify({
        'assets': [{'id': a.id, 'name': a.asset_name, 'category': a.category, 'status': a.status} for a in assets],
        'users': [{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role} for u in users],
        'issues': [{'id': i.id, 'asset_name': i.asset.asset_name if i.asset else '', 'description': i.issue_description[:60], 'status': i.status} for i in issues],
    })
