import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MapPin, Heart, ArrowRight, Zap, Home as HomeIcon, UserCheck, ShieldOff } from "lucide-react";
import "../styles/home.css"; 
import { toast } from "react-hot-toast";
import Chatbot from "../components/Chatbot";

// Images
import room1 from "../assets/Images/room1.jpg";
import room2 from "../assets/Images/room2.jpg";

export function LuxeCard({ pg, isFav, onToggleFav }) {
  const navigate = useNavigate();

  return (
    <div className="luxe-card" onClick={() => navigate(`/pg/${pg._id}`)}>
      <div className="card-media">
        <img src={pg.images?.[0]?.url || "/no-image.png"} alt={pg.name} />

        {onToggleFav && (
          <button 
            className={`fav-icon-btn ${isFav ? "is-active" : ""}`}
            onClick={(e) => onToggleFav(e, pg._id)}
          >
            <Heart 
              className="heart-icon"
              fill={isFav ? "#ff385c" : "rgba(0,0,0,0.3)"} 
              stroke={isFav ? "#ff385c" : "#fff"} 
              size={18} 
            />
            <span className="like-count">{pg.totalLikes || 0}</span>
          </button>
        )}

        <div className="card-price-tag">
          ₹{pg.price}<span>/mo</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-location">
            <MapPin size={12} /> {pg.address?.city}
          </span>
          <span className="card-badge">Premium</span>
        </div>

        <h3 className="card-title">{pg.name}</h3>

        <div className="card-footer">
          <span className="availability-indicator">
            <span className="dot"></span>
            {pg.availableRooms} slots remaining
          </span>

          <div className="view-btn">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({ search, setSearch }) {
  const navigate = useNavigate();
  const [pgs, setPgs] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Chatbot condition
  const showChat = token && user?.role === "client";

  useEffect(() => {
    const initPage = async () => {
      try {
        const [pgRes, favRes] = await Promise.all([
          fetch("http://localhost:3000/api/pg/all"),
          token
            ? fetch("http://localhost:3000/api/pg/favorites/me", {
                headers: { Authorization: `Bearer ${token}` }
              })
            : Promise.resolve({ ok: false, json: () => [] })
        ]);

        if (pgRes.ok) setPgs(await pgRes.json());
        if (favRes.ok) setFavorites(await favRes.json());
      } catch (err) {
        console.error(err);
      }
    };

    initPage();
  }, [token]);

  const filteredPGs = pgs.filter((pg) => {
    const term = (search || "").toLowerCase();
    return (
      pg.name?.toLowerCase().includes(term) ||
      pg.address?.city?.toLowerCase().includes(term)
    );
  });

  const toggleFavorite = async (e, pgId) => {
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to save your favorites pgs.");
      return navigate("/login");
    }

    if (user?.role !== "client") {
      return toast.error("Owners cannot favorite properties");
    }

    try {
      const res = await fetch(`http://localhost:3000/api/pg/${pgId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites);

        setPgs((prev) =>
          prev.map((p) =>
            p._id === pgId ? { ...p, totalLikes: data.totalLikes } : p
          )
        );

        toast.success("List updated");
      }
    } catch (err) {
      toast.error("Connection failed");
    }
  };

  return (
    <div className="home-root">
      <Navbar search={search} setSearch={setSearch} />

      <main className="home-content">

        {/* HERO */}
        <header className="roomify-hero">
          <div className="hero-container">

            <div className="hero-left">
              <div className="hero-badge">⚡ Smart Living Starts Here</div>

              <h1 className="hero-title">
                Find Your <br />
                <span>Perfect Stay</span>
              </h1>

              <p className="hero-subtitle">
                Discover verified PGs, co-living spaces & rooms tailored to your lifestyle
              </p>

              <div className="hero-search">
                <input
                  placeholder="Search by area, price, or amenities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}>
                  Explore
                </button>
              </div>

              {/* FEATURES */}
              <div className="hero-features">
                <div className="feature-pill"><HomeIcon size={14}/> List Your PG</div>
                <div className="feature-pill"><UserCheck size={14}/> Direct Contact Owner</div>
                <div className="feature-pill"><ShieldOff size={14}/> No Brokerage</div>
                <div className="feature-pill"><Zap size={14}/> Fast Booking</div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="hero-right">
              <div className="hero-image-stack">
                <img src={room1} className="img-main" alt="Room" />
                <img src={room2} className="img-secondary" alt="Interior" />
              </div>
            </div>

          </div>

          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </header>

        {/* PG GRID */}
        <section className="pg-grid">
          {filteredPGs.length === 0 ? (
            <div className="empty-results">
              No properties found. Try a different search.
            </div>
          ) : (
            filteredPGs.map((pg) => (
              <LuxeCard
                key={pg._id}
                pg={pg}
                isFav={favorites.some((f) => (f._id || f) === pg._id)}
                onToggleFav={toggleFavorite}
              />
            ))
          )}
        </section>
      </main>

      {/* ✅ CHATBOT (ONLY FOR CLIENT USERS) */}
      {showChat && <Chatbot />}

      <Footer />
    </div>
  );
}