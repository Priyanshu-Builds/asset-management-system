from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, User, Asset, AssetAssignment, Issue, ActivityLog
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    claims = get_jwt()
    role = claims.get('role', 'employee')
    user_id = int(claims.get('sub'))

    if role in ['admin', 'it_manager']:
        total_users = User.query.count()
        total_assets = Asset.query.count()
        assigned_assets = Asset.query.filter_by(status='assigned').count()
        open_issues = Issue.query.filter(Issue.status.in_(['open', 'in_progress'])).count()

        status_counts = db.session.query(
            Asset.status, func.count(Asset.id)
        ).group_by(Asset.status).all()
        asset_status = {s: c for s, c in status_counts}

        category_counts = db.session.query(
            Asset.category, func.count(Asset.id)
        ).group_by(Asset.category).all()
        asset_categories = [{'category': c, 'count': n} for c, n in category_counts]

        recent_activities = ActivityLog.query.order_by(
            ActivityLog.timestamp.desc()
        ).limit(10).all()

        recent_issues = Issue.query.order_by(
            Issue.created_at.desc()
        ).limit(5).all()

        return jsonify({
            'role': role,
            'total_users': total_users,
            'total_assets': total_assets,
            'assigned_assets': assigned_assets,
            'open_issues': open_issues,
            'asset_status': asset_status,
            'asset_categories': asset_categories,
            'recent_activities': [a.to_dict() for a in recent_activities],
            'recent_issues': [i.to_dict() for i in recent_issues]
        })
    else:
        my_assignments = AssetAssignment.query.filter_by(
            employee_id=user_id, status='active'
        ).all()
        my_asset_ids = [a.asset_id for a in my_assignments]
        my_assets_count = len(my_assignments)

        my_issues_open = Issue.query.filter(
            Issue.employee_id == user_id,
            Issue.status.in_(['open', 'in_progress'])
        ).count()

        my_issues_resolved = Issue.query.filter(
            Issue.employee_id == user_id,
            Issue.status == 'resolved'
        ).count()

        my_total_issues = Issue.query.filter_by(employee_id=user_id).count()

        my_recent_issues = Issue.query.filter_by(
            employee_id=user_id
        ).order_by(Issue.created_at.desc()).limit(5).all()

        my_assigned_assets = []
        for a in my_assignments:
            asset = a.asset
            if asset:
                my_assigned_assets.append({
                    'id': asset.id,
                    'asset_name': asset.asset_name,
                    'category': asset.category,
                    'brand': asset.brand,
                    'status': asset.status,
                    'assigned_date': a.assigned_date.isoformat() if a.assigned_date else None,
                })

        return jsonify({
            'role': 'employee',
            'my_assets_count': my_assets_count,
            'my_issues_open': my_issues_open,
            'my_issues_resolved': my_issues_resolved,
            'my_total_issues': my_total_issues,
            'my_recent_issues': [i.to_dict() for i in my_recent_issues],
            'my_assigned_assets': my_assigned_assets,
        })
