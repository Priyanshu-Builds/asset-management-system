from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Issue, AssetAssignment, ActivityLog, Asset, User
from datetime import datetime, timedelta

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    claims = get_jwt()
    role = claims.get('role', 'employee')
    user_id = int(claims.get('sub'))

    notifications = []
    now = datetime.utcnow()

    if role in ['admin', 'it_manager']:
        # Recent issues reported (last 7 days)
        recent_issues = Issue.query.filter(
            Issue.created_at >= now - timedelta(days=7)
        ).order_by(Issue.created_at.desc()).limit(5).all()

        for issue in recent_issues:
            age = now - issue.created_at
            notifications.append({
                'id': f'issue-{issue.id}',
                'text': f'New issue reported on {issue.asset.asset_name if issue.asset else "Unknown Asset"}',
                'time': _time_ago(age),
                'type': 'issue',
                'created_at': issue.created_at.isoformat(),
            })

        # Recent assignments (last 7 days)
        recent_assignments = AssetAssignment.query.filter(
            AssetAssignment.created_at >= now - timedelta(days=7)
        ).order_by(AssetAssignment.created_at.desc()).limit(5).all()

        for assign in recent_assignments:
            age = now - assign.created_at
            asset_name = assign.asset.asset_name if assign.asset else 'Unknown'
            emp_name = assign.employee.name if assign.employee else 'Unknown'
            notifications.append({
                'id': f'assign-{assign.id}',
                'text': f'Asset "{asset_name}" assigned to {emp_name}',
                'time': _time_ago(age),
                'type': 'assignment',
                'created_at': assign.created_at.isoformat(),
            })

        # Recent activity logs (last 7 days)
        recent_logs = ActivityLog.query.filter(
            ActivityLog.timestamp >= now - timedelta(days=7)
        ).order_by(ActivityLog.timestamp.desc()).limit(5).all()

        for log in recent_logs:
            age = now - log.timestamp
            notifications.append({
                'id': f'log-{log.id}',
                'text': log.action,
                'time': _time_ago(age),
                'type': 'activity',
                'created_at': log.timestamp.isoformat(),
            })

        # New users registered (last 7 days)
        new_users = User.query.filter(
            User.created_at >= now - timedelta(days=7)
        ).order_by(User.created_at.desc()).limit(3).all()

        for u in new_users:
            age = now - u.created_at
            notifications.append({
                'id': f'user-{u.id}',
                'text': f'User {u.name} was added',
                'time': _time_ago(age),
                'type': 'user',
                'created_at': u.created_at.isoformat(),
            })

    else:
        # Employee: their assignments
        my_assignments = AssetAssignment.query.filter_by(
            employee_id=user_id
        ).order_by(AssetAssignment.created_at.desc()).limit(5).all()

        for assign in my_assignments:
            age = now - assign.created_at
            asset_name = assign.asset.asset_name if assign.asset else 'Unknown'
            notifications.append({
                'id': f'assign-{assign.id}',
                'text': f'Asset "{asset_name}" was assigned to you',
                'time': _time_ago(age),
                'type': 'assignment',
                'created_at': assign.created_at.isoformat(),
            })

        # Employee: their issues and status updates
        my_issues = Issue.query.filter_by(
            employee_id=user_id
        ).order_by(Issue.created_at.desc()).limit(5).all()

        for issue in my_issues:
            age = now - issue.created_at
            asset_name = issue.asset.asset_name if issue.asset else 'Unknown'
            if issue.status == 'resolved':
                text = f'Your issue on "{asset_name}" has been resolved'
            elif issue.status == 'in_progress':
                text = f'Your issue on "{asset_name}" is being worked on'
            else:
                text = f'You reported an issue on "{asset_name}"'
            notifications.append({
                'id': f'issue-{issue.id}',
                'text': text,
                'time': _time_ago(age),
                'type': 'issue',
                'created_at': issue.created_at.isoformat(),
            })

    # Sort by created_at descending and limit to 10
    notifications.sort(key=lambda x: x['created_at'], reverse=True)
    notifications = notifications[:10]

    return jsonify({'notifications': notifications})


def _time_ago(delta):
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return 'Just now'
    elif seconds < 3600:
        mins = seconds // 60
        return f'{mins} min ago' if mins == 1 else f'{mins} mins ago'
    elif seconds < 86400:
        hours = seconds // 3600
        return f'{hours} hour ago' if hours == 1 else f'{hours} hours ago'
    else:
        days = seconds // 86400
        return f'{days} day ago' if days == 1 else f'{days} days ago'
