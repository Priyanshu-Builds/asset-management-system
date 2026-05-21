from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta
import os
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# CORS: allow Vercel frontend in production, everything in dev
cors_origins = os.environ.get('CORS_ORIGINS', '*')
CORS(app, resources={r"/*": {"origins": cors_origins.split(',')}})
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
db.init_app(app)

from routes.auth import auth_bp
from routes.users import users_bp
from routes.assets import assets_bp
from routes.assignments import assignments_bp
from routes.issues import issues_bp
from routes.maintenance import maintenance_bp
from routes.activity_logs import activity_logs_bp
from routes.dashboard import dashboard_bp
from routes.search import search_bp
from routes.notifications import notifications_bp
from routes.graph import graph_bp

app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(assets_bp)
app.register_blueprint(assignments_bp)
app.register_blueprint(issues_bp)
app.register_blueprint(maintenance_bp)
app.register_blueprint(activity_logs_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(search_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(graph_bp)


@app.route('/')
def index():
    return {'message': 'Vaultix API', 'status': 'running'}


@app.route('/health')
def health():
    return {'status': 'ok'}


# Create tables on startup (works with both flask run and gunicorn)
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

