import React from 'react';
import './MapLegend.css';

const MapLegend = ({ isVisible, toggleVisibility, locations, onSelectLocation, searchTerm, setSearchTerm }) => {
  return (
    <div className={`map-legend ${isVisible ? 'visible' : ''}`}>
      <button className="legend-toggle" onClick={toggleVisibility}>
        {isVisible ? '←' : '→'}
      </button>
      {isVisible && (
        <div className="legend-content">
          <h3>Campus Locations</h3>
          <input
            type="text"
            placeholder="Search location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-box"
          />
          <div className="location-grid">
            {locations.map((location, index) => (
              <div
                key={index}
                className="location-card"
                onClick={() => onSelectLocation(location)}
                title={location.description}
              >
                <strong>{location.name}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
