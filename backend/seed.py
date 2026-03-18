import pymysql

connection = pymysql.connect(host='localhost', user='root', password='Priyanshu02')
cursor = connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS asset_management")
connection.close()

from app import app, bcrypt, db
from models import User, Asset, AssetAssignment, Issue, MaintenanceRecord, ActivityLog
from datetime import date, datetime


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        admin = User(
            name='Admin User', email='admin@company.com',
            password=bcrypt.generate_password_hash('admin123').decode('utf-8'),
            role='admin', department='Management'
        )
        it_mgr = User(
            name='Rahul Sharma', email='rahul@company.com',
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            role='it_manager', department='IT'
        )
        emp1 = User(
            name='Priyanshu Sharma', email='priyanshu@company.com',
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            role='employee', department='Engineering'
        )
        emp2 = User(
            name='Amit Kumar', email='amit@company.com',
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            role='employee', department='Marketing'
        )
        emp3 = User(
            name='Sneha Gupta', email='sneha@company.com',
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            role='employee', department='Design'
        )
        emp4 = User(
            name='Vikram Singh', email='vikram@company.com',
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            role='employee', department='Engineering'
        )
        emp5 = User(
            name='Neha Verma', email='neha@company.com',
            password=bcrypt.generate_password_hash('password123').decode('utf-8'),
            role='employee', department='HR'
        )
        db.session.add_all([admin, it_mgr, emp1, emp2, emp3, emp4, emp5])
        db.session.flush()

        assets_data = [
            Asset(asset_name='MacBook Pro 16"', category='Electronics', brand='Apple', model='M3 Pro', serial_number='MBP-2024-001', purchase_date=date(2024, 1, 15), warranty_expiry=date(2027, 1, 15), status='assigned'),
            Asset(asset_name='Dell Monitor 27"', category='Electronics', brand='Dell', model='U2723QE', serial_number='DM-2024-002', purchase_date=date(2024, 2, 10), warranty_expiry=date(2027, 2, 10), status='available'),
            Asset(asset_name='Herman Miller Chair', category='Furniture', brand='Herman Miller', model='Aeron', serial_number='HMC-2024-003', purchase_date=date(2024, 3, 5), warranty_expiry=date(2036, 3, 5), status='assigned'),
            Asset(asset_name='ThinkPad X1 Carbon', category='Electronics', brand='Lenovo', model='Gen 11', serial_number='TPX-2024-004', purchase_date=date(2024, 1, 20), warranty_expiry=date(2027, 1, 20), status='available'),
            Asset(asset_name='Adobe Creative Suite', category='Software', brand='Adobe', model='CC 2024', serial_number='ACS-2024-005', purchase_date=date(2024, 4, 1), warranty_expiry=date(2025, 4, 1), status='assigned'),
            Asset(asset_name='Toyota Fortuner', category='Vehicles', brand='Toyota', model='2024 Legender', serial_number='TF-2024-006', purchase_date=date(2024, 5, 15), warranty_expiry=date(2029, 5, 15), status='available'),
            Asset(asset_name='Standing Desk', category='Furniture', brand='FlexiSpot', model='E7 Pro', serial_number='SD-2024-007', purchase_date=date(2024, 2, 28), warranty_expiry=date(2029, 2, 28), status='under_maintenance'),
            Asset(asset_name='Microsoft 365 License', category='Software', brand='Microsoft', model='E5', serial_number='MS-2024-008', purchase_date=date(2024, 1, 1), warranty_expiry=date(2025, 1, 1), status='available'),
            Asset(asset_name='iPhone 15 Pro', category='Electronics', brand='Apple', model='Pro Max', serial_number='IP-2024-009', purchase_date=date(2024, 3, 10), warranty_expiry=date(2026, 3, 10), status='assigned'),
            Asset(asset_name='HP LaserJet Printer', category='Electronics', brand='HP', model='MFP M234', serial_number='HLP-2024-010', purchase_date=date(2024, 6, 1), warranty_expiry=date(2027, 6, 1), status='available'),
            Asset(asset_name='Logitech Webcam', category='Electronics', brand='Logitech', model='C920', serial_number='LW-2024-011', purchase_date=date(2024, 2, 15), warranty_expiry=date(2026, 2, 15), status='retired'),
            Asset(asset_name='Conference Table', category='Furniture', brand='IKEA', model='BEKANT', serial_number='CT-2024-012', purchase_date=date(2024, 4, 20), warranty_expiry=date(2034, 4, 20), status='available'),
            Asset(asset_name='Slack Enterprise', category='Software', brand='Slack', model='Enterprise Grid', serial_number='SE-2024-013', purchase_date=date(2024, 1, 1), warranty_expiry=date(2025, 1, 1), status='available'),
            Asset(asset_name='Honda City', category='Vehicles', brand='Honda', model='2024 ZX', serial_number='HC-2024-014', purchase_date=date(2024, 7, 10), warranty_expiry=date(2029, 7, 10), status='assigned'),
            Asset(asset_name='Mechanical Keyboard', category='Electronics', brand='Keychron', model='Q1 Pro', serial_number='MK-2024-015', purchase_date=date(2024, 3, 25), warranty_expiry=date(2026, 3, 25), status='available'),
        ]
        db.session.add_all(assets_data)
        db.session.flush()

        assignments = [
            AssetAssignment(asset_id=1, employee_id=emp1.id, assigned_date=date(2024, 1, 20)),
            AssetAssignment(asset_id=3, employee_id=emp2.id, assigned_date=date(2024, 3, 10)),
            AssetAssignment(asset_id=5, employee_id=emp3.id, assigned_date=date(2024, 4, 5)),
            AssetAssignment(asset_id=9, employee_id=emp4.id, assigned_date=date(2024, 3, 15)),
            AssetAssignment(asset_id=14, employee_id=emp1.id, assigned_date=date(2024, 7, 15)),
        ]
        db.session.add_all(assignments)

        issues = [
            Issue(asset_id=1, employee_id=emp1.id, issue_description='Battery draining too fast, only lasts 3 hours', status='open'),
            Issue(asset_id=7, employee_id=emp2.id, issue_description='Standing desk motor is making grinding noise', status='in_progress'),
            Issue(asset_id=5, employee_id=emp3.id, issue_description='Adobe Photoshop keeps crashing on startup', status='open'),
            Issue(asset_id=9, employee_id=emp4.id, issue_description='Screen flickering intermittently', status='resolved'),
        ]
        db.session.add_all(issues)

        maintenance = [
            MaintenanceRecord(asset_id=7, maintenance_date=date(2024, 8, 1), technician='Ravi Tech Services', description='Motor replacement for standing desk', cost=4500.00),
            MaintenanceRecord(asset_id=11, maintenance_date=date(2024, 7, 15), technician='IT Support', description='Webcam lens cleaning and firmware update', cost=500.00),
        ]
        db.session.add_all(maintenance)

        logs = [
            ActivityLog(user_id=admin.id, action='Created asset: MacBook Pro 16"', module='Assets', timestamp=datetime(2024, 1, 15, 10, 0)),
            ActivityLog(user_id=admin.id, action='Assigned asset "MacBook Pro 16\\"" to Priyanshu Sharma', module='Assignments', timestamp=datetime(2024, 1, 20, 14, 30)),
            ActivityLog(user_id=it_mgr.id, action='Created asset: Dell Monitor 27"', module='Assets', timestamp=datetime(2024, 2, 10, 9, 0)),
            ActivityLog(user_id=emp1.id, action='Reported issue for MacBook Pro 16"', module='Issues', timestamp=datetime(2024, 8, 5, 11, 0)),
            ActivityLog(user_id=it_mgr.id, action='Maintenance scheduled for Standing Desk', module='Maintenance', timestamp=datetime(2024, 8, 1, 8, 0)),
            ActivityLog(user_id=admin.id, action='Created user: Sneha Gupta', module='Users', timestamp=datetime(2024, 3, 1, 10, 0)),
            ActivityLog(user_id=emp3.id, action='Reported issue for Adobe Creative Suite', module='Issues', timestamp=datetime(2024, 8, 10, 15, 0)),
            ActivityLog(user_id=it_mgr.id, action='Updated issue #4 status to resolved', module='Issues', timestamp=datetime(2024, 8, 12, 16, 0)),
        ]
        db.session.add_all(logs)

        db.session.commit()
        print("Database seeded successfully!")
        print("\nLogin Credentials:")
        print("Admin:      admin@company.com / admin123")
        print("IT Manager: rahul@company.com / password123")
        print("Employee:   priyanshu@company.com / password123")


if __name__ == '__main__':
    seed()
