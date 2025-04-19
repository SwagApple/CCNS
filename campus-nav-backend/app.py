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


print("Starting Flask app...")
app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = "temp"
jwt = JWTManager(app)

users = {'user@email.com': 'password'}

from models import *

app.config.from_object(Config)
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

G = ox.graph_from_place("Florida Polytechnic University, Florida, USA", network_type='walk')

@app.route('/api/route', methods=['POST'])
def get_route():
    data = request.json
    print(f"Received data: {data}")
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

    
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    salt = db.session.query(User.salt).filter_by(email=email).first()[0]
    password_hash, _ = hash_password(data.get('password'), salt)
    password_val = db.session.query(User.password_hash).filter_by(email=email).first()[0]
    
    if password_hash == password_val:
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify(message='Invalid credentials'), 401
    
    
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password_hash, salt = hash_password(data.get('password'))
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
    


if __name__ == '__main__':
    app.run(debug=True)