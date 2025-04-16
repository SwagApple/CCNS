import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const currentRouteRef = useRef(null);
  const [legendVisible, setLegendVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  const locations = [
    { name: 'IST', lat: 28.150248, lon: -81.850817, description: 'Innovation Science and Technology Building', category: 'Academic' },
    { name: 'BARC', lat: 28.149558, lon: -81.851529, description: 'Barnett Applied Research Center', category: 'Academic' },
    { name: 'Phase I Residence Hall', lat: 28.150920, lon: -81.848913, description: 'Residence Hall', category: 'Housing' },
    { name: 'Phase II Residence Hall', lat: 28.150111, lon: -81.847578, description: 'Residence Hall', category: 'Housing' },
    { name: 'Phase III Residence Hall', lat: 28.149780, lon: -81.848194, description: 'New Residence Hall', category: 'Housing' },
    { name: 'ASC East', lat: 28.149681, lon: -81.847819, description: 'Academic Success Center', category: 'Student Services' },
    { name: 'Wellness Dining Center', lat: 28.149283, lon: -81.847111, description: 'Dining Hall', category: 'Dining' },
    { name: 'SDC', lat: 28.148020, lon: -81.845619, description: 'Student Development Center', category: 'Student Services' },
  ];

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const filteredGrouped = locations
    .filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .reduce((acc, loc) => {
      acc[loc.category] = acc[loc.category] || [];
      acc[loc.category].push(loc);
      return acc;
    }, {});

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
      center: [28.148826, -81.849305],
      zoom: 16,
      minZoom: 16,
      maxZoom: 18,
      zoomControl: false,
      preferCanvas: false,
      maxBounds: [
        [28.143108, -81.856137],
        [28.155217, -81.842069],
      ],
      maxBoundsViscosity: 1.0,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

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
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setLegendVisible(!legendVisible)}
        className="legend-toggle"
      >
        {legendVisible ? '⟨' : '⟩'}
      </button>

      {/* Sidebar Legend */}
      <div className={`map-legend ${legendVisible ? 'visible' : ''}`}>
        <input
          type="text"
          placeholder="Search location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-box"
        />
        <div className="location-dropdowns">
          {Object.entries(filteredGrouped).map(([category, locs]) => (
            <div key={category} className="category-section">
              <div
                className="category-header"
                onClick={() => toggleCategory(category)}
              >
                <strong>{category} ({locs.length})</strong>
                <span>{expandedCategories[category] ? '▾' : '▸'}</span>
              </div>
              {expandedCategories[category] && (
                <div className="location-list">
                  {locs.map((loc, idx) => (
                    <div
                      key={idx}
                      className="location-card"
                      onClick={() => handleDestinationClick(loc)}
                      title={loc.description}
                    >
                      {loc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
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
    </>
  );
};

export default MapPage;
