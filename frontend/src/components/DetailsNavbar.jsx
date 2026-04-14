import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Home } from "lucide-react";
import "../styles/detailsnavbar.css";

export default function DetailsNavbar({ pgName, isFavorite, onToggleFav, user }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Effect to show the PG Name in navbar only after scrolling past the header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard! ✨");
  };

  return (
    <nav className={`details-nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-left">
          <button className="nav-circle-btn" onClick={() => navigate("/")}>
            <ChevronLeft size={20} />
          </button>
          <div className={`nav-pg-title ${scrolled ? "show" : ""}`}>
            {pgName}
          </div>
        </div>

        <div className="nav-right">
          <button className="nav-action-btn" onClick={handleShare}>
            <Share2 size={18} />
            <span>Share</span>
          </button>
          
          {(!user || user.role === 'client') && (
            <button 
              className={`nav-action-btn ${isFavorite ? "fav-active" : ""}`} 
              onClick={onToggleFav}
            >
              <Heart size={18} fill={isFavorite ? "#ff385c" : "none"} />
              <span>{isFavorite ? "Saved" : "Save"}</span>
            </button>
          )}

          <button className="nav-circle-btn" onClick={() => navigate("/")}>
            <Home size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}