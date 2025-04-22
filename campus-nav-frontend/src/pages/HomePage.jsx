import './HomePage.css';
import MapPage from '../components/MapPage';
import NavBar from '../components/NavBar';


function HomePage() {
    return (
        <div className="home-page">
            <div className="nav-bar-container">
                <NavBar />
            </div>
            <div className="map-utility">
                <div className="map-container">
                    <MapPage />
                </div>
            </div>
        </div>
    );
}

export default HomePage
