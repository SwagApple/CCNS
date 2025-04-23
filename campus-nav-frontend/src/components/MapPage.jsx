import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import { useNavigate } from 'react-router-dom';

// These images are used for the default and selected markers on the map.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Override default icon handling in Leaflet
// This ensures the marker icons appear properly
delete L.Icon.Default.prototype._getIconUrl;

// Sets default marker icons (blue) and selected marker icon (violet)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultIcon = new L.Icon.Default(); // Blue

const selectedIcon = new L.Icon({ // Violet for poly purple
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

const MapPage = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate between routes

  // Refs to store map instance and markers
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const currentRouteRef = useRef(null);
  const selectedLocationRef = useRef(null);
  const locationMarkersRef = useRef([]);

  // State variables to manage map and location interactions
  const [legendVisible, setLegendVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMarkerName, setSelectedMarkerName] = useState(null);
  const [getDirectionsUsed, setGetDirectionsUsed] = useState(false);
  const [arrived, setArrived] = useState(false);

  // List of locations with their coordinates, descriptions, and categories
  // This data is used to populate the map and the sidebar legend
  const locations = [
    { name: 'IST', lat: 28.150248, lon: -81.850817, description: 'The Innovation Science and Technology (IST) Building serves as the center of life on campus. It contains:\n• Classrooms\n• Labs\n• Club rooms\n• Faculty offices\n• The Academic Success Center\n• The Library (fully digital)\n• The Mosiac Cafe', categories: ['Academic', 'Student Services', 'Dining'] },
    { name: 'BARC', lat: 28.149558, lon: -81.851529, description: 'The Barnett Applied Research Center (BARC) provides:\n• Research laboratories\n• Teaching laboratories\n• Classrooms\n• Student design spaces\n• Conference rooms\n• Faculty offices\n• Study areas', categories: ['Academic'] },
    { name: 'Phase I Residence Hall', lat: 28.150920, lon: -81.848913, description: 'Residence Hall I', categories: ['Housing']  },
    { name: 'Phase II Residence Hall', lat: 28.150111, lon: -81.847578, description: 'Residence Hall II', categories: ['Housing'] },
    { name: 'Phase III Residence Hall', lat: 28.149780, lon: -81.848194, description: 'Residence Hall III', categories: ['Housing']  },
    { name: 'The Access Point', lat: 28.149681, lon: -81.847819, description: 'The Access Point provides a wide variety of student services including:\n• CARE Services\n• Counseling Services\n• Food Pantry\n• Disability Services & ODS Testing Center\n• Sexual Misconduct and Title IX', categories: ['Student Services'] },
    { name: 'Wellness Center', lat: 28.149283, lon: -81.847111, description: 'The Wellness Center is home to:\n• Auxilliary Enterprises Service Center\n• Dining:\n-The Fuse\n-Einsteins Brother\'s Bagels\n-Fire + Ash: Concepts Reborn\n• The Nest\n• Student Health Clinic\n• Student Business Services', categories: ['Student Services', 'Dining']  },
    { name: 'SDC', lat: 28.148020, lon: -81.845619, description: 'The Student Development Center (SDC) provides access to:\n• Gym\n• Esports Arena/Arcade\n• Outdoor competition-sized swimming pool\n• Fitness related services', categories: ['Student Services'] },
    { name: 'Unviersity Police Department', lat: 28.150802, lon: -81.846864, description: 'The University Police Department is staffed by a team of veteran law enforcement officers who are trained and prepared to respond to campus emergencies and prevent on-campus crime.', categories: ['Campus Safety'] },
    { name: 'Admissions Center', lat: 28.150177, lon: -81.846113, description: 'The Admissions Center houses admissions and financial aid staff.', categories: ['Student Services'] },
    { name: 'IFF Global Citrus Innovation Center', lat: 28.146871, lon: -81.850335, description: 'Research facility aimed at accelerating innovation by combining the expertise of IFF scientists with Florida Poly\'s top researchers and STEM-focused students.', categories: ['Student Services'] },
    { name: 'Facilities and Safety Services', lat: 28.150882, lon: -81.846702, description: 'Facilities and Safety Services maintains our stunning buildings and surroundings inside and out, supports events on campus, facilitates construction projects, and maintains environmental health and safety.', categories: ['Campus Safety'] },
    { name: 'Campus Store', lat: 28.149416, lon: -81.847985, description: 'Buy merchandise and more at the NEW Florida Poly Campus Store!', categories: ['Student Services'] }
  ];

  // Toggles the visibility of location categories in the sidebar
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Filters and groups locations based on the search term and their categories
  const filteredGrouped = locations
    .filter(loc => {
      const term = searchTerm.toLowerCase();
      return loc.name.toLowerCase().includes(term) || loc.description.toLowerCase().includes(term);
    })
    .reduce((acc, loc) => {
      loc.categories.forEach(category => {
        acc[category] = acc[category] || [];
        acc[category].push(loc);
      });
      return acc;
    }, {});

  // Sends a POST request to the backend to get a sidewalk-based route
  // between the user's current position and the selected destination  
  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',  Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ start, end })
      }); 
    
      const data = await response.json();
      if (response.status !== 200) {
        alert("Please log in");
        navigate('/login');
        return;
      }
      return data.route;
    } catch (err) {
      console.error("Route fetch failed:", err);
      return null;
    }
  };

  // Renders a red polyline for the route on the map,
  // removing any previously drawn route
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

  // Sets the selected destination and draws a route to it from the user's current location
  // Called when "Get Directions" is pressed
  const handleDestinationClick = async (destinationCoords) => {
    selectedLocationRef.current = destinationCoords;  // <-- Add this line
    setGetDirectionsUsed(true);  // Make sure this is set too
    const userCoords = userMarkerRef.current.getLatLng();
    const route = await fetchRoute(
      [userCoords.lat, userCoords.lng],
      [destinationCoords.lat, destinationCoords.lon]
    );
    drawRoute(mapInstance.current, route);
  };

  // Called on user movement to recalculate and redraw the route dynamically
  const updateLiveRoute = async (userCoords, destinationCoords) => {
    const route = await fetchRoute(
      [userCoords.lat, userCoords.lng],
      [destinationCoords.lat, destinationCoords.lon]
    );
    drawRoute(mapInstance.current, route);
  };
  
  
  // Initializes the Leaflet map and adds all location markers to it
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
  
    mapInstance.current = map;
  
    L.control.zoom({ position: 'topright' }).addTo(map);
  
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lon], {
        icon: location.name === selectedMarkerName ? selectedIcon : defaultIcon,
        opacity: 1,
      }).addTo(map);
  
      marker.on('click', () => {
        setSelectedLocation(location);
        setSelectedMarkerName(location.name);
        setLegendVisible(true);
        setGetDirectionsUsed(false);
        if (currentRouteRef.current) {
          mapInstance.current.removeLayer(currentRouteRef.current);
          currentRouteRef.current = null;
        }
      });
      locationMarkersRef.current.push(marker);
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
  }, []);
  
  // Continuously updates the user's marker location
  // Redraws route in real-time and triggers "Arrived" popup when near destination
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latlng = L.latLng(position.coords.latitude, position.coords.longitude);
  
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(latlng);
        }
  
        if (getDirectionsUsed && mapInstance.current) {
          mapInstance.current.setView(latlng);
        }
  
        const destination = selectedLocationRef.current;
        if (destination && getDirectionsUsed) {
          updateLiveRoute(latlng, destination);
  
          const distance = latlng.distanceTo([destination.lat, destination.lon]);
          if (distance < 20 && !arrived) {
            setArrived(true);
          } else if (distance >= 20 && arrived) {
            setArrived(false);
          }
        }
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
  
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [getDirectionsUsed, arrived]);
  
  // Re-adds all markers with appropriate coloring after a location is selected
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
  
    // Remove all markers except user's location marker (if using one)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
        map.removeLayer(layer);
      }
    });
  
    // Re-add marker with updated icon color
    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lon], {
        icon: location.name === selectedMarkerName ? selectedIcon : defaultIcon,
        opacity: 1,
      }).addTo(map);
  
      marker.on('click', () => {
        setSelectedLocation(location);
        setSelectedMarkerName(location.name);
        setLegendVisible(true);
        setGetDirectionsUsed(false);
        if (currentRouteRef.current) {
          mapInstance.current.removeLayer(currentRouteRef.current);
          currentRouteRef.current = null;
        }
      });
      locationMarkersRef.current.push(marker);
    });
  }, [selectedMarkerName, locations]);

  // Syncs the selected location with a ref to be accessible in async calls and callbacks
  useEffect(() => {
    selectedLocationRef.current = selectedLocation;
  }, [selectedLocation]);
  
  // Fades out non-destination markers when navigation is active
  useEffect(() => {
    locationMarkersRef.current.forEach((marker) => {
      const latlng = marker.getLatLng();
      const isDestination =
        latlng.lat === selectedLocationRef.current?.lat &&
        latlng.lng === selectedLocationRef.current?.lon;
  
      marker.setOpacity(getDirectionsUsed ? (isDestination ? 1 : 0.3) : 1);
    });
  }, [getDirectionsUsed, selectedLocation]);
  

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setLegendVisible(!legendVisible)}
        className="legend-toggle"
      >
        {legendVisible ? '⟨' : '⟩'}
      </button>

      {/* Sidebar Panel */}
      <div className={`map-legend ${legendVisible ? 'visible' : ''}`}>
        {selectedLocation ? (
          // Location Info Panel
          <div className="location-info">
            <button className="close-btn" onClick={() => {
              setSelectedMarkerName(null); 
              setSelectedLocation(null);
              setGetDirectionsUsed(false);
              if (currentRouteRef.current) {
                mapInstance.current.removeLayer(currentRouteRef.current);
                currentRouteRef.current = null;
              }
            }}>
              ×
            </button>
            <h2>{selectedLocation.name}</h2>
            <p>
              {selectedLocation.description.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            {/*Get Directions Button*/}
            <button
              onClick={async () => { 
                setLegendVisible(false);
                handleDestinationClick(selectedLocation);
                setGetDirectionsUsed(true);
              }
              }>
              Get Directions
            </button>
          </div>
        ) : (
          // Default Legend View
          <>
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
                          onClick={() => {
                            setSelectedLocation(loc);
                            setSelectedMarkerName(loc.name);
                            setLegendVisible(true);
                            setGetDirectionsUsed(false);
                            
                          }}
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
          </>
        )}
      </div>

      {/* Arrival popup UI */}
      {arrived && (
        <div className="arrival-popup">
          <div className="arrival-popup-content">
            <h2>You have arrived!</h2>
            <button
              onClick={() => {
                setArrived(false);
                setSelectedMarkerName(null);
                setSelectedLocation(null);
                setGetDirectionsUsed(false);
                if (currentRouteRef.current) {
                  mapInstance.current.removeLayer(currentRouteRef.current);
                  currentRouteRef.current = null;
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          height: "100%",
          width: "100%"
        }}
      />
    

    </>
  );
};

export default MapPage;
