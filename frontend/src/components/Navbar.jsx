import React from "react";
import { Link, useLocation } from "react-router-dom"; // 🟢 Added useLocation
import { Search, HelpCircle } from "lucide-react";
import '../styles/navbar.css';
import logo from "../assets/original.png";
// import {HelpDashboard} from "Help.jsx";
import HelpDashboard from "./Help.jsx"; // Add the .jsx extension manually

export default function Navbar({ search, setSearch }) {
  const location = useLocation(); // 🟢 Detects which page the user is on

  return (
    <nav className="luxe-navbar">
      <div className="nav-container">
        
        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Roomify" />
        </Link>

        {/* SEARCH BAR */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search for your next space..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="search-submit-btn">Search</button>
        </div>

        {/* RIGHT SIDE: AUTH & HELP */}
        <div className="nav-actions">
          <div className="auth-pill">
            <Link to="/login" className="auth-item login-link">
              Login
            </Link>
            <div className="pill-divider"></div>
            <Link to="/signup" className="auth-item signup-link">
              Sign Up
            </Link>
          </div>

          {/* 🟢 Updated Help Link with Active State Styling */}
          <Link 
            to="/help" 
            className={`help-link ${location.pathname === '/help' ? 'active-link' : ''}`}
          >
            <HelpCircle size={20} />
            <span>Help</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}