import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet's CSS is loaded
import './MapPage.css';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const currentRouteRef = useRef(null);



  // Locations 
  const locations = [
    { name: 'IST', lat: 28.150750, lon: -81.851380, description: 'The Innovation Science and Technology (IST) Building' },
    { name: 'BARC', lat: 28.149203, lon: -81.852061, description: 'Barnett Applied Research Center' },
    { name: 'Phase I Residence Hall', lat: 28.150920, lon: -81.848913, description: 'Residence Hall' },
    { name: 'Phase II Residence Hall', lat: 28.150111, lon: -81.847578, description: 'Residence Hall' },
    { name: 'Phase III Residence Hall', lat: 28.149780, lon: -81.848194, description: 'New Residence Hall' },
    { name: 'ASC East', lat: 28.149681, lon: -81.847819, description: 'The Academic Success Center East. Home to CARE Services.' },
    { name: 'Wellness Dining Center', lat: 28.149283, lon: -81.847111, description: 'Wellness Dining Center' },
    { name: 'SDC', lat: 28.148020, lon: -81.845619, description: 'Student Developement Center (SDC)' },

  ];

  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch('http://localhost:5000/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end })
      });
      const data = await response.json();
      return data.route;
    } catch (err) {
      console.error("Route fetch failed:", err);
      return null;
    }
  };

  const drawRoute = (map, routeCoords) => {
    if (!routeCoords || routeCoords.length === 0) return;
    
    // Remove the previous route if it exists
    if (currentRouteRef.current) {
      map.removeLayer(currentRouteRef.current);
    }
  
    const latLngs = routeCoords.map(coord => L.latLng(coord[0], coord[1]));
    const polyline = L.polyline(latLngs, {
      color: 'red',
      weight: 6,
      opacity: 0.7,
    }).addTo(map);
    
    currentRouteRef.current = polyline;
  };
  
  
  const handleDestinationClick = async (destinationCoords) => {
    console.log('Routing to:', destinationCoords.name);

    const userCoords = userMarkerRef.current.getLatLng();
    const route = await fetchRoute(
      [userCoords.lat, userCoords.lng],
      [destinationCoords.lat, destinationCoords.lon]
    );
    drawRoute(mapInstance.current, route);
    
  };
  


  useEffect(() => {
    if (mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [28.148826,-81.849305],
      zoom: 16,
      minZoom: 16,
      maxZoom: 18,
      zoomControl: true,
      preferCanvas: false,
      maxBounds: [
        [28.143108, -81.856137],
        [28.155217, -81.842069],
      ],
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    
    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lon]).addTo(map);
      marker.bindPopup(`<b>${location.name}</b><br>${location.description}`);
      marker.on('click', () => handleDestinationClick(location));
    });
    
    const pulsingIcon = L.divIcon({
      className: '',
      html: '<div class="pulsing-marker"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });


    userMarkerRef.current = L.marker([28.148826, -81.849305], {
      icon: pulsingIcon,
    }).addTo(map);    

    navigator.geolocation.watchPosition(
      (position) => {
        const latlng = L.latLng(
          position.coords.latitude,
          position.coords.longitude
        );
        userMarkerRef.current.setLatLng(latlng);
        map.setView(latlng);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    

    mapInstance.current = map;
  }, []);

 

  return (
    <div
      ref={mapRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 0,
      }}
    />
  );
};

export default MapPage;
