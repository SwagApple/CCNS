from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    salt = db.Column(db.String(200), nullable=False)
    fname = db.Column(db.String(50), nullable=False)
    lname = db.Column(db.String(50), nullable=False)

class Locations(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    categories = db.Column(db.ARRAY(db.Text))  # PostgreSQL-specific

    def to_dict(self):
        return {
            'name': self.name,
            'lat': self.lat,
            'lon': self.lon,
            'description': self.description,
            'categories': self.categories
        }
    