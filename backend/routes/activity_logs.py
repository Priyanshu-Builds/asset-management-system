from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, ActivityLog

activity_logs_bp = Blueprint('activity_logs', __name__)


@activity_logs_bp.route('/activity-logs', methods=['GET'])
@jwt_required()
def get_activity_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = ActivityLog.query.order_by(
        ActivityLog.timestamp.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'logs': [l.to_dict() for l in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })
