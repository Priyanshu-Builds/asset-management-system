from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Issue, ActivityLog

issues_bp = Blueprint('issues', __name__)


@issues_bp.route('/issues', methods=['GET'])
@jwt_required()
def get_issues():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status_filter = request.args.get('status', '')

    claims = get_jwt()
    query = Issue.query

    if claims.get('role') == 'employee':
        query = query.filter_by(employee_id=int(claims['sub']))

    if status_filter:
        query = query.filter(Issue.status == status_filter)

    pagination = query.order_by(Issue.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'issues': [i.to_dict() for i in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@issues_bp.route('/issues', methods=['POST'])
@jwt_required()
def create_issue():
    data = request.get_json()
    claims = get_jwt()

    issue = Issue(
        asset_id=data.get('asset_id'),
        employee_id=int(claims['sub']),
        issue_description=data.get('issue_description'),
        status='open'
    )
    db.session.add(issue)

    log = ActivityLog(
        user_id=int(claims['sub']),
        action=f'Reported issue for asset #{data.get("asset_id")}',
        module='Issues'
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Issue reported', 'issue': issue.to_dict()}), 201


@issues_bp.route('/issues/<int:issue_id>', methods=['PUT'])
@jwt_required()
def update_issue(issue_id):
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'it_manager']:
        return jsonify({'error': 'Admin or IT Manager access required'}), 403

    issue = Issue.query.get_or_404(issue_id)
    data = request.get_json()

    issue.status = data.get('status', issue.status)
    issue.issue_description = data.get('issue_description', issue.issue_description)

    log = ActivityLog(
        user_id=int(claims['sub']),
        action=f'Updated issue #{issue_id} status to {issue.status}',
        module='Issues'
    )
    db.session.add(log)

    db.session.commit()

    return jsonify({'message': 'Issue updated', 'issue': issue.to_dict()})
