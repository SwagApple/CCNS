from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import folium

app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = "temp"
jwt = JWTManager(app)

users = {'user@email.com': 'password'}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/map', methods=['POST'])
def map_view():
    # Get latitude and longitude from the user
    latitude = float(request.form['latitude'])
    longitude = float(request.form['longitude'])

    # Create a Folium map centered on the user's location
    m = folium.Map(location=[latitude, longitude], zoom_start=13)
    folium.Marker([latitude, longitude], popup='You are here!').add_to(m)

    # Save map to an HTML file
    map_html = "templates/map.html"
    m.save(map_html)

    return render_template('map.html')
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Username: {email}, Password: {password}")
    # Here you would normally check the credentials
    if users.get(email) == password:
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify(message='Invalid credentials'), 401
    


if __name__ == '__main__':
    app.run(debug=True)