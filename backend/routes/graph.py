from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, User, Asset, AssetAssignment, Issue, MaintenanceRecord

graph_bp = Blueprint('graph', __name__)


@graph_bp.route('/graph-data', methods=['GET'])
@jwt_required()
def get_graph_data():
    users = User.query.all()
    assets = Asset.query.all()
    assignments = AssetAssignment.query.all()
    issues = Issue.query.all()
    maintenance = MaintenanceRecord.query.all()

    nodes = []
    links = []

    # 1. Users
    for u in users:
        nodes.append({
            'id': f"user-{u.id}",
            'label': u.name,
            'type': 'user',
            'details': {
                'role': u.role,
                'email': u.email,
                'department': u.department,
                'status': u.status,
                'avatar': u.avatar
            }
        })

    # 2. Assets
    for a in assets:
        nodes.append({
            'id': f"asset-{a.id}",
            'label': a.asset_name,
            'type': 'asset',
            'details': {
                'category': a.category,
                'brand': a.brand,
                'model': a.model,
                'serial_number': a.serial_number,
                'status': a.status
            }
        })

    # 3. Issues
    for i in issues:
        nodes.append({
            'id': f"issue-{i.id}",
            'label': f"Issue: {i.issue_description[:20]}...",
            'type': 'issue',
            'details': {
                'description': i.issue_description,
                'status': i.status,
                'created_at': i.created_at.isoformat() if i.created_at else None
            }
        })
        
        # User reported this issue
        links.append({
            'source': f"user-{i.employee_id}",
            'target': f"issue-{i.id}",
            'label': 'reported',
            'type': 'reported'
        })
        
        # Issue affects this asset
        links.append({
            'source': f"issue-{i.id}",
            'target': f"asset-{i.asset_id}",
            'label': 'affects',
            'type': 'affects'
        })

    # 4. Maintenance Records
    for m in maintenance:
        nodes.append({
            'id': f"maintenance-{m.id}",
            'label': f"Maint: {m.technician}",
            'type': 'maintenance',
            'details': {
                'technician': m.technician,
                'cost': m.cost,
                'date': m.maintenance_date.isoformat() if m.maintenance_date else None,
                'description': m.description
            }
        })
        
        # Maintenance links to Asset
        links.append({
            'source': f"maintenance-{m.id}",
            'target': f"asset-{m.asset_id}",
            'label': 'maintained',
            'type': 'maintained'
        })

    # 5. Asset Assignments (direct link between User and Asset)
    for assign in assignments:
        links.append({
            'source': f"user-{assign.employee_id}",
            'target': f"asset-{assign.asset_id}",
            'label': 'assigned' if assign.status == 'active' else 'returned',
            'type': 'assigned',
            'details': {
                'status': assign.status,
                'assigned_date': assign.assigned_date.isoformat() if assign.assigned_date else None,
                'return_date': assign.return_date.isoformat() if assign.return_date else None
            }
        })

    return jsonify({
        'nodes': nodes,
        'links': links
    })
