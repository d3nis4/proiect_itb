import { Link } from "react-router-dom";
import "./header.css";

const Header=() => {
    return (
        <header className="header-container">
            <Link to="/" className="header-title">
                TokenBridge
            </Link>
        </header>
    );
};

export default Header;
