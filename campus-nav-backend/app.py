from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import folium
import networkx as nx
import osmnx as ox
from flask_sqlalchemy import SQLAlchemy
from config import Config
from authHash import hash_password
import os

RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY')

# Start Flask app
print("Starting Flask app...")
app = Flask(__name__)
CORS(app)

# Set up JSON Web Token (JWT) for authentication
app.config['JWT_SECRET_KEY'] = "temp"
jwt = JWTManager(app)

# Set up database
from models import *

app.config.from_object(Config)
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

# Build Route
G = ox.graph_from_place("Florida Polytechnic University, Florida, USA", network_type='walk')

# Get all locations
@app.route('/api/locations', methods=['GET'])
@jwt_required()
def get_locations():
    # Query the database for all locations
    locations = db.session.query(Locations).all()
    # Convert the locations to a list of dictionaries
    locations_list = [location.to_dict() for location in locations]
    print(f"Locations: {locations_list[-1]}")
    # Return the locations as JSON
    return jsonify(locations_list)

# Add a new location
@app.route('/api/locations/', methods=['POST'])
@jwt_required()
def add_location():
    # Check if the user is an admin
    email = get_jwt_identity()
    user = db.session.query(User).filter_by(email=email).first()
    if not user or not user.is_admin:
        return jsonify(message='Unauthorized'), 403
        pass
    # Unpack the request data
    data = request.get_json()
    name = data.get('name')
    lat = data.get('latitude')
    lon = data.get('longitude')
    description = data.get('description')
    categories = data.get('category')
    categories = [categories]
    print(categories)

    # Check if the location already exists
    existing_location = db.session.query(Locations).filter_by(name=name).first()
    if existing_location:
        return jsonify(message='Location already exists'), 409

    # Create a new location
    new_location = Locations(name=name, lat=lat, lon=lon, description=description)
    new_location.categories = categories
    db.session.add(new_location)
    db.session.commit()

    return jsonify(message='Location added successfully'), 201

# Get route between two locations
@app.route('/api/route', methods=['POST'])
@jwt_required()
def get_route():
    data = request.json
    #print(f"Received data: {data}")
    user_start = tuple(data['start'])  # format: [lat, lon]
    user_end = tuple(data['end'])
    
    try:
        # Snap coordinates to nearest nodes on the walking network
        start_node = ox.distance.nearest_nodes(G, X=user_start[1], Y=user_start[0])
        end_node = ox.distance.nearest_nodes(G, X=user_end[1], Y=user_end[0])

        # Compute shortest path using edge lengths
        route = nx.shortest_path(G, source=start_node, target=end_node, weight='length')

        # Convert node IDs to lat/lon for the frontend to draw the path
        route_coords = [(G.nodes[n]['y'], G.nodes[n]['x']) for n in route]  # lat, lon
        return jsonify({'route': route_coords})
    
    except nx.NetworkXNoPath:
        return jsonify({'error': 'No path found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Log into account  
@app.route('/api/login', methods=['POST'])
def login():
    # Unpack the request data
    data = request.get_json()
    email = data.get('email')
    # Query the database for the password hash and salt
    try:
        salt = db.session.query(User.salt).filter_by(email=email).first()[0]
        password_hash, _ = hash_password(data.get('password'), salt)
        password_val = db.session.query(User.password_hash).filter_by(email=email).first()[0]
    except Exception as e:
        return jsonify(message='Invalid credentials'), 401
    # Check if the password hash matches the stored hash
    # If the password is correct, create a JWT token
    # If the password is incorrect, return an error
    if password_hash == password_val:
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify(message='Invalid credentials'), 401
    
# Register a new user
@app.route('/api/register', methods=['POST'])
def register():
    # Unpack the request data
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    # Validate password length
    if len(password) < 10:
        return jsonify(message='Password must be at least 8 characters long'), 400
    # Hash the password
    password_hash, salt = hash_password(password)
    fname = data.get('fname')
    lname = data.get('lname')

    # Check if the user already exists
    existing_user = db.session.query(User).filter_by(email=email).first()
    if existing_user:
        return jsonify(message='User already exists'), 409

    # Here you would normally save the user to the database
    new_user = User(email=email, password_hash=password_hash, salt=salt, fname=fname, lname=lname)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message='User registered successfully'), 201
    
# Get user information
@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    email = get_jwt_identity()
    user = db.session.query(User).filter_by(email=email).first()
    if user:
        return jsonify(user.to_dict()), 200
    else:
        return jsonify(message='User not found'), 404

# Update user information   
@app.route('/api/user', methods=['PUT'])
@jwt_required()
def update_user():
    email = get_jwt_identity()
    data = request.get_json()
    user = db.session.query(User).filter_by(email=email).first()
    data = request.get_json()
    if user:
        # Update user fields
        if 'fname' in data:
            user.fname = data['fname']
        if 'lname' in data:
            user.lname = data['lname']
        if 'email' in data:
            user.email = data['email']
        if 'password' in data:
            # Hash the new password
            old_password_check = data.get('password')
            salt = user.salt
            password_hash, _ = hash_password(old_password_check, salt)
            if password_hash != user.password_hash:
                return jsonify(message='Old password is incorrect'), 401
            # Hash the new password
            password_hash, salt = hash_password(data['newPassword'], user.salt)
            user.password_hash = password_hash
            user.salt = salt

        db.session.commit()
        return jsonify(message='User updated successfully'), 200
    else:
        return jsonify(message='User not found'), 404
    


    


if __name__ == '__main__':
    app.run(debug=True)