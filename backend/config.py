import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key-change-in-production')

    # Railway gives mysql:// but SQLAlchemy needs mysql+pymysql://
    _db_url = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://root:Priyanshu02@localhost:3306/asset_management'
    )
    if _db_url.startswith('mysql://'):
        _db_url = _db_url.replace('mysql://', 'mysql+pymysql://', 1)

    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True,
        'pool_size': 5,
        'max_overflow': 10,
    }

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
