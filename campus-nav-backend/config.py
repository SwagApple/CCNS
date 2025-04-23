import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    db_uri = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False