import './AdminPage.css'
import { useState } from 'react';

function AdminPage() {
    const [locName, setLocName] = useState("");
    const [locDesc, setLocDesc] = useState("");
    const [locLat, setLocLat] = useState("");
    const [locLong, setLocLong] = useState("");
    const [locCat, setLocCat] = useState("");
    const token = localStorage.getItem('token');

    // Function to handle adding a location
    // It sends a POST request to the server with the location details
    const handleAddLocation = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: locName,
                    description: locDesc,
                    latitude: locLat,
                    longitude: locLong,
                    category: locCat,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add location');
            }

            const data = await response.json();
            alert('Location added successfully');
        } catch (error) {
            console.error(error);
        }
    }
    
    return (
        <div className="admin-page">
            <div className="admin-info">
                <h2>Add A Location</h2>
                <input type="text" placeholder="Location Name" value={locName} onChange={(e) => setLocName(e.target.value)}/>
                <input type="text" placeholder="Location Description" value={locDesc} onChange={(e) => setLocDesc(e.target.value)}/>
                <input type="text" placeholder="Location Latitude" value={locLat} onChange={(e) => setLocLat(e.target.value)}/>
                <input type="text" placeholder="Location Longitude" value={locLong} onChange={(e) => setLocLong(e.target.value)}/>
                <input type="text" placeholder="Location Category" value={locCat} onChange={(e) => setLocCat(e.target.value)}/>
                <button onClick={handleAddLocation}>Add Location</button>
            </div>
        </div>
    );
}

export default AdminPage