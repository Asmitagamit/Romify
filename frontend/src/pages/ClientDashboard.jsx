import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../styles/client.css";
// ✅ Named import from Home library
import { LuxeCard } from "./Home"; 
// import ReceiptModal from "./models/Receipt.js";
import ReceiptModal from "./ReceiptModal"; // ✅ Ensure this file exists

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { X, FileText, Download, Trash2, Clock } from "lucide-react";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [savedRooms, setSavedRooms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendedPGs, setRecommendedPGs] = useState([]);
  
  // ✅ NEW: State for the Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ================= FETCHING LOGIC =================
  
  const loadFavorites = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:3000/api/pg/favorites/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Dashboard Fav Fetch Error:", err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/pg/all");
      setRecommendedPGs(res.data.slice(0, 3)); 
    } catch (err) {
      console.error("Error fetching recommended PGs:", err);
    }
  };

  const fetchRequests = async () => {
    const userId = user?._id || user?.id;
    if (!userId || !token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/api/requests/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch single receipt data for the modal
  const openReceiptModal = async (requestId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/receipts/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveReceipt(res.data);
    } catch (err) {
      toast.error("Receipt not found or not generated yet.");
    }
  };

const toggleFavoriteFromDashboard = async (e, pgId) => {
  e.stopPropagation();
  if (!token) return;
  try {
    const res = await axios.post(`http://localhost:3000/api/pg/${pgId}/favorite`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.status === 200) {
      // ✅ FIX: Sync LocalStorage so other pages stay updated
      const updatedUser = { ...user, favorites: res.data.favorites };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      loadFavorites();
      toast.success("Removed from shortlist");
    }
  } catch (err) {
    toast.error("Failed to update favorites");
  }
};

  const deleteRequest = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/requests/${id}/delete-client`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); 
      toast.success("Record cleared");
    } catch (err) { toast.error("Delete failed"); }
  };

  const downloadReceipt = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/requests/${id}/download-receipt`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Error downloading PDF");
    }
  };

  // Initial Load
  useEffect(() => {
    loadFavorites();
    fetchRequests();
    fetchRecommended();
  }, []);

  // Tab Sync Logic
  useEffect(() => {
    if (activeTab === "favorites" || activeTab === "dashboard") loadFavorites();
    if (activeTab === "bookings") fetchRequests();
  }, [activeTab]);

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <div className="luxe-dashboard-root">
      <UserNavbar />
      
      <main className="dashboard-main-content">
        <header className="dashboard-hero">
          <div className="hero-profile-info">
            <div className="luxe-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hero-text">
              <h1 className="luxe-title">Welcome back, {firstName}!</h1>
              <p className="luxe-subtitle">Manage your stays and saved spaces in one place.</p>
            </div>
          </div>
          
          <nav className="dashboard-tabs-nav">
            <button className={activeTab === "dashboard" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("dashboard")}>Overview</button>
            <button className={activeTab === "bookings" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("bookings")}>My Bookings</button>
            <button className={activeTab === "favorites" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("favorites")}>Favorites</button>
            <button className={activeTab === "profile" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("profile")}>My Details</button>
          </nav>
        </header>

        <hr className="luxe-divider" />

        <section className="dashboard-viewport-container">
          
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="section-fade">
              {savedRooms.length > 0 && (
                <div className="overview-section">
                  <h2 className="content-heading">Your Shortlist</h2>
                  <div className="pg-grid-container" style={{ marginBottom: '40px' }}>
                    {savedRooms.slice(0, 2).map((pg) => (
                      <LuxeCard 
                        key={pg._id} 
                        pg={pg} 
                        isFav={true} 
                        onToggleFav={toggleFavoriteFromDashboard} 
                      />
                    ))}
                  </div>
                </div>
              )}
              <h2 className="content-heading">Recommended for You</h2>
              <div className="pg-grid-container">
                {recommendedPGs.map((pg) => (
                  <LuxeCard key={pg._id} pg={pg} />
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="section-fade profile-grid">
              <div className="luxe-card-flat profile-info-card">
                <h2 className="content-heading">Your Details</h2>
                <div className="profile-details-list">
                  <div className="detail-item"><label>Full Name</label><p>{user?.name || "N/A"}</p></div>
                  <div className="detail-item"><label>Email Address</label><p>{user?.email || "N/A"}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="section-fade">
              <h2 className="content-heading">Active Reservations</h2>
              {loading ? (
                <div className="luxe-loader-text">Syncing your data...</div>
              ) : requests.length === 0 ? (
                <div className="empty-state-luxe">No active bookings found.</div>
              ) : (
                <div className="booking-grid">
                  {requests.map((req) => (
                    <div key={req._id} className="booking-card luxe-card-flat">
                      <img src={req.pgId?.images?.[0]?.url || "/no-image.png"} alt="PG" className="booking-img" />
                      <div className="booking-content">
                        <div className="booking-header">
                            <h3>{req.pgId?.name || "Premium PG"}</h3>
                            <span className={`status-pill ${req.status}`}>{req.status?.toUpperCase()}</span>
                        </div>
                        <div className="booking-details-luxe">
                          <p><strong>Move-in:</strong> {req.formData?.moveInDate ? new Date(req.formData.moveInDate).toLocaleDateString() : "TBD"}</p>
                          <p><strong>Stay:</strong> {req.formData?.stayDuration || "Flexible"}</p>
                        </div>
                        <div className="booking-actions">
                          {req.status === "rejected" && <button className="delete-btn" onClick={() => deleteRequest(req._id)}><Trash2 size={16}/> Clear</button>}
                          {req.status === "pending" && <p className="pending-note"><Clock size={14}/> Awaiting owner approval</p>}
                          {req.status === "approved" && (
                            <>
                              <button className="view-receipt-btn" onClick={() => openReceiptModal(req._id)}> Download Digital Receipt</button>
                              {/* <button className="download-receipt-btn" onClick={() => downloadReceipt(req._id)}>Download PDF</button> */}
                              {/* <button className="download-receipt-btn" onClick={() => openReceiptModal(req._id)}><Download size={16}/> Download PDF</button> */}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="section-fade">
              <h2 className="content-heading">Your Favorites</h2>
              <div className="pg-grid-container">
                {savedRooms.length > 0 ? (
                  savedRooms.map((pg) => (
                    <LuxeCard 
                      key={pg._id} 
                      pg={pg} 
                      isFav={true} 
                      onToggleFav={toggleFavoriteFromDashboard} 
                    />
                  ))
                ) : (
                  <div className="empty-state-luxe">
                    <p>Your shortlist is empty.</p>
                    <button className="explore-btn" onClick={() => navigate('/')}>Find a Room</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ✅ MODAL RENDER: This floats over the dashboard when data is fetched */}
      {activeReceipt && (
        <ReceiptModal 
          receipt={activeReceipt} 
          onClose={() => setActiveReceipt(null)} 
        />
      )}

      <Footer />
    </div>
  );
}