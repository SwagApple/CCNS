import './HomePage.css';
import MapPage from '../components/MapPage';
import NavBar from '../components/NavBar';
import Search from '../components/Search';


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
                <div className="search-container">
                    <Search />
                </div>
            </div>
        </div>
    );
}

export default HomePage