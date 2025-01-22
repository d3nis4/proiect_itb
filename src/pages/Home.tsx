import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <main className="home-container">
            <div className="content">
                <h2 className="heading">Welcome to TokenBridge</h2>
                <p className="subheading">Transfer your IBT between MetaMask and Sui wallets.</p>
                <button onClick={() => navigate("/bridge")}>
                    Begin Bridging
                </button>
            </div>
        </main>
    );
};

export default Home;
