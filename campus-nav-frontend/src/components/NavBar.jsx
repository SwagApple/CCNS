import { useNavigate } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
    const navigate = useNavigate();
    return (
        <div className="nav-bar">
            <div className="nav-bar-logo">
                <img src="/logo.png" alt="Campus Nav Logo" />
            </div>
            <div className="nav-bar-profile">
                <img 
                    onClick={() => navigate("/account")}
                    src="/profile.png" alt="Profile Icon"
                />
            </div>
        </div>
    );
}

export default NavBar;