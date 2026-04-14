import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Rating } from "react-simple-star-rating"; 
import {
  Wifi, Wind, Utensils, Waves, Bath, Shield, 
  MapPin, Calendar, Info, ChevronLeft, ChevronRight, CheckCircle, Heart,
  Home, Bed, Users, IndianRupee, Sofa, Lock
} from "lucide-react";
import "../styles/PgDetails.css";
import RequestForm from "./RequestForm";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
// ✅ Import the new specialized Navbar
import DetailsNavbar from "../components/DetailsNavbar";

export default function PgDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPg] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // --- FAVORITE STATE ---
  const [isFavorite, setIsFavorite] = useState(false);

  // --- REVIEW STATES ---
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchPG = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/pg/${id}`);
      setPg(res.data);
      
      if (user && user.favorites) {
        const favIds = user.favorites.map(f => f._id || f);
        setIsFavorite(favIds.includes(id));
      }
    } catch (err) {
      console.error("Failed to fetch PG:", err);
    }
  };

  useEffect(() => {
    fetchPG();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user || !token) return toast.error("Please login to save favorites");
    try {
      const res = await axios.post(`http://localhost:3000/api/pg/${id}/favorite`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const { favorites, totalLikes } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...user, favorites }));
      setIsFavorite(!isFavorite);
      setPg(prev => ({ ...prev, totalLikes }));
      toast.success(isFavorite ? "Removed" : "Added to Wishlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleReview = async () => {
    if (!user) return toast.error("Please login to leave a review");
    if (rating === 0) return toast.error("Please select a star rating");
    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:3000/api/pg/${id}/reviews`, { rating, message }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      toast.success("Review shared!");
      setRating(0);
      setMessage("");
      fetchPG(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Error posting review");
    } finally { setIsSubmitting(false); }
  };

  if (!pg) return <div className="luxe-loader"><span></span></div>;

  const images = pg.images?.length ? pg.images : [{ url: "/no-image.png" }];
  const averageRating = pg.reviews?.length > 0 
    ? (pg.reviews.reduce((a, b) => a + b.rating, 0) / pg.reviews.length).toFixed(1) 
    : "New";

  return (
    <div className="luxe-details-root">
      {/* ✅ NEW: Specialized Details Navbar with real-time props */}
      <DetailsNavbar 
        pgName={pg.name} 
        isFavorite={isFavorite} 
        onToggleFav={handleToggleFavorite} 
        user={user} 
      />

      <div className="luxe-details-container" style={{ marginTop: '80px' }}>
        
        <div className="luxe-details-left">
          {/* BREADCRUMB ROW */}
          <div className="luxe-top-row">
            <div className="breadcrumb-pill">
              <MapPin size={14} /> {pg.address?.locality}, {pg.address?.city}
            </div>
          </div>

          <h1 className="luxe-header-title">{pg.name}</h1>
          <p className="luxe-full-address">{pg.address?.blockNo}, {pg.address?.apartment}, {pg.address?.state} - {pg.address?.pincode}</p>

          {/* QUICK STATS STRIP */}
          <div className="luxe-stats-strip">
            <div className="stat-item"><Bed size={18}/> <span>{pg.totalRooms} Total Rooms</span></div>
            <div className="stat-item"><Users size={18}/> <span>{pg.availableRooms} Vacant Slots</span></div>
            <div className="stat-item"><Home size={18}/> <span>Professional Stay</span></div>
          </div>

          {/* IMAGE GALLERY WITH FLOATING LIKES */}
          <div className="luxe-gallery-engine">
            <div className="luxe-main-stage">
              <img src={images[currentImage].url || images[currentImage]} alt="Property" />
              
              <div className="luxe-image-overlay-tags">
                <div className="luxe-action-group-floating">
                  <span className="like-counter-pill">
                    <Heart size={14} fill="#ff4d4d" stroke="#ff4d4d" /> 
                    {pg.totalLikes || 0}
                  </span>
                  {(!user || user.role === 'client') && (
                    <button 
                      onClick={handleToggleFavorite} 
                      className={`fav-btn-circle ${isFavorite ? 'active' : ''}`}
                    >
                      <Heart size={20} fill={isFavorite ? "#ff4d4d" : "none"} stroke={isFavorite ? "#ff4d4d" : "white"} />
                    </button>
                  )}
                </div>
              </div>

              <button className="stage-nav prev" onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}><ChevronLeft /></button>
              <button className="stage-nav next" onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}><ChevronRight /></button>
            </div>
            
            <div className="luxe-thumb-strip">
              {images.map((img, i) => (
                <div key={i} className={`thumb-box ${currentImage === i ? "active" : ""}`} onClick={() => setCurrentImage(i)}>
                  <img src={img.url || img} alt="Thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <section className="luxe-content-block">
            <h3>Description</h3>
            <p className="description-text">{pg.description}</p>
          </section>

          {/* ALL AMENITIES & FEATURES */}
          <div className="luxe-features-grid">
            <FeatureSection title="Amenities" items={pg.amenities} icon={<Wifi size={16}/>} />
            <FeatureSection title="Furnishing" items={pg.furnishings} icon={<Sofa size={16}/>} />
            <FeatureSection title="Services" items={pg.services} icon={<Utensils size={16}/>} />
            <FeatureSection title="Safety & Security" items={pg.safety} icon={<Shield size={16}/>} />
          </div>

          {/* OWNER INFO SECTION */}
          <div className="luxe-owner-card">
            <h3 className="section-title-small">Host Information</h3>
            <div className="luxe-owner-strip">
              <div className="owner-avatar">{(pg.owner?.name?.[0] || "O")}</div>
              <div className="owner-meta">
                <h4>{pg.owner?.name || "Premium Host"}</h4>
                <p className="owner-badge">Verified Property Owner</p>
                <div className="owner-contact-info">
                   <span>Email: {pg.owner?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* REVIEWS */}
          <section className="luxe-reviews-section">
             <div className="reviews-header">
                <h3>Community Reviews ({pg.reviews?.length || 0})</h3>
                <div className="avg-pill-large">★ {averageRating}</div>
             </div>
             <div className="reviews-grid">
                {pg.reviews?.length > 0 ? pg.reviews.map((rev, i) => (
                  <div key={i} className="modern-rev-card">
                    <div className="rev-user-row">
                        <strong>{rev.user?.name || "Guest"}</strong>
                        <Rating initialValue={rev.rating} readonly size={16} fillColor="#FFD700" />
                    </div>
                    <p>{rev.message}</p>
                  </div>
                )) : <p className="empty-msg">No reviews yet. Be the first to share your experience!</p>}
             </div>
             
             <div className="review-form-card">
                <h4>Experience this place?</h4>
                <div className="rating-input-wrapper">
                  <Rating onClick={(rate) => setRating(rate)} initialValue={rating} size={28} fillColor="#FFD700" transition />
                </div>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your review here..." />
                <button onClick={handleReview} disabled={isSubmitting} className="luxe-post-btn">
                    {isSubmitting ? "Syncing..." : "Post Review"}
                </button>
             </div>
          </section>
        </div>

        {/* RIGHT STICKY CARD */}
        <div className="luxe-details-right">
          <div className="luxe-booking-card">
            <div className="price-header">
              <h2>₹{pg.price}<span>/month</span></h2>
            </div>
            <div className="availability-indicator">
              <div className={`status-dot ${pg.availableRooms > 0 ? "online" : "offline"}`}></div>
              <span>{pg.availableRooms > 0 ? `${pg.availableRooms} Rooms available` : "Sold Out"}</span>
            </div>
            
            <button className="luxe-book-btn" onClick={() => user ? setShowBooking(true) : navigate("/login")}>
              Request Reservation
            </button>

            <div className="booking-perks">
              <div className="perk"><Calendar size={14}/> Instant Move-in</div>
              <div className="perk"><Info size={14}/> Professional Management</div>
              <div className="perk"><Shield size={14}/> Secure Payment</div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && <RequestForm pg={pg} user={user} onClose={() => setShowBooking(false)} />}
      <Footer />
    </div>
  );
}

function FeatureSection({ title, items, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="feature-block">
      <h5 className="feature-title">{icon} {title}</h5>
      <div className="feature-pills">
        {items.map((item, i) => (
          <span key={i} className="feature-pill">{item}</span>
        ))}
      </div>
    </div>
  );
}