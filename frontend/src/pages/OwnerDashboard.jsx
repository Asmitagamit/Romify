import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  LayoutDashboard, PlusCircle, User, Pencil, Trash2, 
  IndianRupee, Image as ImageIcon, Camera, FileText, Check, X, Eye,CheckCircle, 
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MultiSelectDropdown from "./OwnerAmenitiesDropdown";
import UserNavbar from "../components/UserNavbar"; 
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import "../styles/owner.css";
const API_BASE_URL = "http://localhost:3000";

// --- AXIOS INTERCEPTOR ---
// This ensures every request automatically carries the token
// --- REFINED INTERCEPTOR ---
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear(); // Clears both token and user at once
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// This handles the "jwt expired" error globally
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       toast.error("Session expired. Please login again.");
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login"; 
//     }
//     return Promise.reject(error);
//   }
// );
// --- SUB-COMPONENT: INLINE RECEIPT FORM ---
const InlineReceiptForm = ({ req, user, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    owner: user.name,
    ownerId: user.id || user._id,
    requestId: req._id,
    receipt_no: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    tenant_name: req.formData?.fullName || "Tenant",
    property_address: req.pgId?.name || "Premium PG",
    rent_amount: req.pgId?.price || 0,
    charges: { water: 0, electricity: 0, wifi: 0, cleaning: 0, food: 0, tax: 0 },
    total_amount: req.pgId?.price || 0,
    signature: null 
  });

  const handleChargeChange = (e) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    
    setFormData(prev => {
      const updatedCharges = { ...prev.charges, [name]: val };
      // 🟢 Calculate sum of all bills
      const totalBills = Object.values(updatedCharges).reduce((sum, curr) => sum + curr, 0);
      
      return { 
        ...prev, 
        charges: updatedCharges, 
        total_amount: prev.rent_amount + totalBills 
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "charges") data.append("charges", JSON.stringify(formData.charges));
        else if (key !== "signature") data.append(key, formData[key]);
      });
      if (formData.signature instanceof File) data.append("signature", formData.signature);
      
      await axios.post(`${API_BASE_URL}/api/receipts/generate`, data);
      toast.success("Receipt Saved!");
      onSuccess();
    } catch (err) { toast.error("Failed to save receipt"); }
  };

 return (
    <div className="inline-receipt-container">
      <h4 className="section-label-luxe">Generate Distributed Receipt</h4>
      <form onSubmit={handleSave} className="inline-receipt-form">
        <div className="receipt-grid-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <div className="bill-input">
            <label className="mini-label">Water ₹</label>
            <input type="number" name="water" onChange={handleChargeChange} />
          </div>
          <div className="bill-input">
            <label className="mini-label">Elec ₹</label>
            <input type="number" name="electricity" onChange={handleChargeChange} />
          </div>
          <div className="bill-input">
            <label className="mini-label">WiFi ₹</label>
            <input type="number" name="wifi" onChange={handleChargeChange} />
          </div>
          <div className="bill-input">
            <label className="mini-label">Cleaning ₹</label>
            <input type="number" name="cleaning" onChange={handleChargeChange} />
          </div>
          <div className="bill-input">
            <label className="mini-label">Food ₹</label>
            <input type="number" name="food" onChange={handleChargeChange} />
          </div>
          <div className="bill-input">
            <label className="mini-label">Tax ₹</label>
            <input type="number" name="tax" onChange={handleChargeChange} />
          </div>
        </div>
        
        <div className="sig-row" style={{ marginTop: '20px' }}>
          <label className="section-label-luxe" style={{fontSize: '12px'}}>Owner Signature Upload:</label>
          <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, signature: e.target.files[0]})} />
        </div>

        <div className="receipt-action-row" style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <span className="price-tag" style={{fontSize: '1.2rem'}}>Total: ₹{formData.total_amount}</span>
          <div className="btn-group" style={{display: 'flex', gap: '10px'}}>
            <button type="submit" className="luxe-submit-btn" style={{height: '40px'}}>Save Receipt</button>
            <button type="button" onClick={onCancel} className="luxe-cancel-btn" style={{height: '40px'}}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

// --- ADD THIS ABOVE THE COMPONENT ---
const initialFormState = {
  name: "",
  address: { blockNo: "", apartment: "", locality: "", city: "", state: "", pincode: "" },
  price: "", roomType: "",
  amenities: [], furnishings: [], services: [], safety: [],
  images: [], 
  totalRooms: "", availableRooms: "", description: "",
};

// --- MAIN DASHBOARD ---
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [pgs, setPgs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Inside OwnerDashboard component ---
const [editingId, setEditingId] = useState(null); // Add this line!
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeReceiptId, setActiveReceiptId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: { blockNo: "", apartment: "", locality: "", city: "", state: "", pincode: "" },
    price: "", roomType: "",
    amenities: [], furnishings: [], services: [], safety: [],
    images: [], 
    totalRooms: "", availableRooms: "", description: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const AMENITIES = ["Parking", "Lift", "Garden", "Swimming Pool", "Gym", "Clubhouse", "WiFi", "Power Backup", "Study Room"];
  const FURNISHINGS = ["Fan", "Lights", "AC", "Bed", "Fridge", "Washing Machine"];
  const SERVICES = ["Cleaning Service", "Laundry Service", "Food / Mess Facility", "Maintenance"];
  const SAFETY = ["24/7 Security", "CCTV Surveillance", "Biometric Entry"];

  const fetchData = async () => {
    if (!user) return navigate("/login");
    try {
      setLoading(true);
      const [pgRes, reqRes] = await Promise.all([
        axios.get("http://localhost:3000/api/pg/my-pgs"),
        axios.get("http://localhost:3000/api/requests/owner-requests")
      ]);
      setPgs(pgRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      toast.error("Session expired or sync failed");
      if(err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const handleRequestStatus = async (requestId, status) => {
    try {
      await axios.patch(`http://localhost:3000/api/requests/${requestId}/status`, { status });
      toast.success(`Request ${status}`);
      fetchData();
    } catch (err) { toast.error("Update failed"); }
  };

  // --- HANDLERS ---
  const handleEdit = (pg) => {
    setEditingId(pg._id);
    setFormData({
      ...pg,
      images: pg.images || []
    });
    setView("add-property");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/pg/${id}`);
      toast.success("Listing removed");
      fetchData();
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) return toast.error("Max 10 images");
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.images.length < 2) return toast.error("Min 2 images required");
  
  setSubmitting(true);
  try {
    const data = new FormData();
    const token = localStorage.getItem("token"); // 🟢 MUST HAVE TOKEN
    const existingImagesList = []; // <--- NEW: Track old images separately

    // 1. Append basic fields and Address
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "address") {
        Object.keys(value).forEach(sub => data.append(`address[${sub}]`, value[sub]));
      } else if (Array.isArray(value) && key !== "images") {
        data.append(key, JSON.stringify(value));
      } else if (key !== "images") {
        data.append(key, value);
      }
    });

    // 2. 🟢 SMART IMAGE HANDLING
    // const existingImagesList = [];

    formData.images.forEach(img => {
      if (img instanceof File) {
        // New file to be uploaded
        data.append("images", img);
      } else if (img.url) {
        // Keep track of old images to RETAIN in DB
        existingImagesList.push(img);
      }
    });

    // Send the list of existing images as a single stringified array
    data.append("existingImages", JSON.stringify(existingImagesList));

    // 3. 🟢 SENDING THE REQUEST
    const url = editingId ? `/${editingId}` : "";
    const method = editingId ? "put" : "post";

    await axios({
      method: method,
     url: `${API_BASE_URL}/api/pg${url}`, // Uses the constant
      data: data,
      // headers: {
      //   "Content-Type": "multipart/form-data",
      //   "Authorization": `Bearer ${token}` // Ensure backend knows WHO is editing
      // }
    });

    toast.success(editingId ? "Listing Updated" : "Property Published!");

    // Reset Logic
    setEditingId(null);
    setFormData({
      name: "",
      address: { blockNo: "", apartment: "", locality: "", city: "", state: "", pincode: "" },
      price: "", roomType: "",
      amenities: [], furnishings: [], services: [], safety: [],
      images: [], 
      totalRooms: "", availableRooms: "", description: "",
    });
    setView("dashboard");

  } catch (err) {
    console.error("Submission Error:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Submission failed.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="luxe-owner-root">
      {submitting && (
        <div className="luxe-loading-overlay">
          <div className="luxe-spinner-container">
            <div className="luxe-glaze-spinner"></div>
            <p>Syncing Data...</p>
          </div>
        </div>
      )}

      <UserNavbar />
      
      <main className="owner-main-content">
        <header className="owner-hero">
          <div className="hero-text">
            <h1 className="luxe-title">Management Hub</h1>
            <p className="luxe-subtitle">Welcome back, {user?.name}.</p>
          </div>
          <nav className="dashboard-tabs-nav">
            <button className={view === "dashboard" ? "tab-btn active" : "tab-btn"} onClick={() => setView("dashboard")}>
              <LayoutDashboard size={18}/> Overview
            </button>
            <button 
  className={view === "add-property" ? "tab-btn active" : "tab-btn"} 
  onClick={() => { 
    setEditingId(null);            // <--- ADDED: Forces "Add" mode
    setFormData(initialFormState); // <--- ADDED: Clears any leftovers
    setView("add-property"); 
  }}
>
  <PlusCircle size={18}/> Add Property
</button>
            <button className={view === "requests" ? "tab-btn active" : "tab-btn"} onClick={() => setView("requests")}>
              <FileText size={18}/> Requests
            </button>
            <button className={view === "profile" ? "tab-btn active" : "tab-btn"} onClick={() => setView("profile")}>
              <User size={18}/> Mydetails
            </button>
          </nav>
        </header>

        <hr className="luxe-divider" />

        {/* --- OVERVIEW VIEW --- */}
        {view === "dashboard" && (
          <section className="section-fade">
            <h2 className="content-heading">Active Listings</h2>
            {loading ? <div className="loader">Fetching data...</div> : (
              <div className="owner-pg-list">
                {pgs.length === 0 ? <p className="empty-msg">No properties found.</p> : pgs.map(pg => (
                  <div key={pg._id} className="owner-row-card">
                    <img 
  src={pg.images?.[0]?.url || "/no-image.png"} 
  alt="pg" 
  onError={(e) => { e.target.src = "/no-image.png"; }} // <--- ADDED THIS
/>
                    <div className="row-info">
                      <h3>{pg.name}</h3>
                      <p>{pg.address?.locality}, {pg.address?.city}</p>
                    </div>
                    <span className="price-tag"><IndianRupee size={14}/>{pg.price} /mo</span>
                    <div className="row-stats">
                      <div className="stat-box">
                        <label>Availability</label>
                        <span>{pg.availableRooms}/{pg.totalRooms} Rooms</span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button className="edit-btn" onClick={() => handleEdit(pg)}><Pencil size={16}/></button>
                      <button className="delete-btn" onClick={() => handleDelete(pg._id)}><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- REQUESTS & RECEIPTS VIEW --- */}
     {/* --- REQUESTS & RECEIPTS VIEW --- */}
{view === "requests" && (
  <section className="section-fade">
    <div className="content-header-flex">
      <h2 className="content-heading">Tenant Inquiries</h2>
      <p className="content-sub-info">Review and manage booking requests</p>
    </div>

    <div className="activity-table-container">
      <table className="luxe-table">
        <thead>
          <tr>
            <th>Tenant Details</th>
            <th>Property</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr><td colSpan="4" className="empty-msg">No inquiries received yet.</td></tr>
          ) : (
            requests.map((req) => (
              <React.Fragment key={req._id}>
                <tr className="luxe-tr">
                  <td>
                    <div className="tenant-cell">
                      <span className="tenant-name-bold">{req.formData?.fullName || "Tenant"}</span>
                      <button className="view-details-link" onClick={() => setSelectedRequest(req)}>
                        View full details
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="property-cell">
                      <span className="property-tag-luxe">{req.pgId?.name || "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-status ${req.status}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell-right">
                      {req.status === "pending" ? (
                        <div className="btn-group-row">
                          <button className="approve-btn-luxe" onClick={() => handleRequestStatus(req._id, "approved")}>
                            <Check size={14}/> Approve
                          </button>
                          <button className="reject-btn-luxe" onClick={() => handleRequestStatus(req._id, "rejected")}>
                            <X size={14}/> Reject
                          </button>
                        </div>
                      ) : req.status === "approved" ? (
                        <button className="view-receipt-btn-luxe" onClick={() => setActiveReceiptId(activeReceiptId === req._id ? null : req._id)}>
                          {activeReceiptId === req._id ? "Close Form" : "Create Receipt"}
                        </button>
                      ) : (
                        <span className="text-muted-luxe">Closed</span>
                      )}
                    </div>
                  </td>
                </tr>
                {/* Inline Receipt Form Injection */}
                {activeReceiptId === req._id && (
                  <tr className="inline-form-row">
                    <td colSpan="4">
                      <InlineReceiptForm 
                        req={req} 
                        user={user} 
                        onCancel={() => setActiveReceiptId(null)} 
                        onSuccess={() => { setActiveReceiptId(null); fetchData(); }} 
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
)}

        {/* --- ADD/EDIT VIEW --- */}
      {/* --- ADD/EDIT VIEW --- */}
{view === "add-property" && (
  <section className="section-fade form-container-luxe">
    <div className="form-header-luxe">
      <h2 className="content-heading">{editingId ? "Refine Property Details" : "List New Property"}</h2>
      <p className="luxe-subtitle">Ensure all fields match your physical property for better verification.</p>
    </div>

    <form onSubmit={handleSubmit} className="luxe-form">
      
      {/* 1. BASIC INFORMATION */}
      <div className="form-section">
        <label className="section-label-luxe"><FileText size={16} /> Basic Information</label>
        <div className="input-group">
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Property Name (e.g., Skyview Luxury PG)" 
            required 
          />
        </div>
        <div className="input-group">
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Describe the rooms, environment, and nearby landmarks..." 
            required 
          />
        </div>
      </div>

      {/* 2. PHYSICAL ADDRESS (Replaced MapPin with Home) */}
      <div className="form-section">
        <label className="section-label-luxe"><Home size={16} /> Property Address</label>
        <div className="form-row">
          <input className="input-half" name="address.blockNo" value={formData.address.blockNo} onChange={handleChange} placeholder="Block / Plot No." required />
          <input className="input-half" name="address.apartment" value={formData.address.apartment} onChange={handleChange} placeholder="Apartment / Building Name" required />
        </div>
        <div className="form-row">
          <input className="input-half" name="address.locality" value={formData.address.locality} onChange={handleChange} placeholder="Locality / Area" required />
          <input className="input-half" name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" required />
        </div>
        <div className="form-row">
          <input className="input-half" name="address.state" value={formData.address.state} onChange={handleChange} placeholder="State" required />
          <input className="input-half" name="address.pincode" value={formData.address.pincode} onChange={handleChange} placeholder="Pincode" required />
        </div>
      </div>

      {/* 3. INVENTORY & PRICING */}
      <div className="form-section">
        <label className="section-label-luxe"><IndianRupee size={16} /> Inventory & Pricing</label>
        <div className="form-row">
          <div className="input-group">
            <label className="mini-label">Monthly Rent (₹)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
          </div>
          <div className="input-group">
            <label className="mini-label">Total Rooms</label>
            <input type="number" name="totalRooms" value={formData.totalRooms} onChange={handleChange} placeholder="Total" required />
          </div>
          <div className="input-group">
            <label className="mini-label">Available Now</label>
            <input type="number" name="availableRooms" value={formData.availableRooms} onChange={handleChange} placeholder="Vacant" required />
          </div>
        </div>
      </div>

      {/* 4. MULTI-SELECT DROPDOWNS */}
      <div className="form-section">
        <label className="section-label-luxe"><CheckCircle size={16} /> Amenities & Features</label>
        <div className="dropdown-grid">
          <MultiSelectDropdown title="General Amenities" options={AMENITIES} selectedItems={formData.amenities} setSelectedItems={items => setFormData(p => ({...p, amenities: items}))} showDropdown={openDropdown === "amenities"} setShowDropdown={val => setOpenDropdown(val ? "amenities" : null)} />
          <MultiSelectDropdown title="Room Furnishings" options={FURNISHINGS} selectedItems={formData.furnishings} setSelectedItems={items => setFormData(p => ({...p, furnishings: items}))} showDropdown={openDropdown === "furnishings"} setShowDropdown={val => setOpenDropdown(val ? "furnishings" : null)} />
          <MultiSelectDropdown title="Daily Services" options={SERVICES} selectedItems={formData.services} setSelectedItems={items => setFormData(p => ({...p, services: items}))} showDropdown={openDropdown === "services"} setShowDropdown={val => setOpenDropdown(val ? "services" : null)} />
          <MultiSelectDropdown title="Safety & Security" options={SAFETY} selectedItems={formData.safety} setSelectedItems={items => setFormData(p => ({...p, safety: items}))} showDropdown={openDropdown === "safety"} setShowDropdown={val => setOpenDropdown(val ? "safety" : null)} />
        </div>
      </div>

      {/* 5. IMAGE UPLOAD */}
      <div className="form-section">
        <label className="section-label-luxe"><ImageIcon size={16} /> Gallery (Min 2 images)</label>
        <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
          <Camera size={32} color="var(--cta-copper)" />
          <p>Click to upload property photos</p>
          <input id="fileInput" type="file" multiple hidden onChange={handleImageUpload} accept="image/*" />
        </div>
        
        <div className="image-preview-grid">
          {formData.images.map((img, index) => (
            <div key={index} className="preview-card">
              <img src={img instanceof File ? URL.createObjectURL(img) : img.url} alt="Preview" />
              <button type="button" className="remove-img-btn" onClick={() => handleRemoveImage(index)}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
<div className="form-actions-luxe">
  <button 
    type="submit" 
    className="luxe-submit-btn" 
    disabled={submitting}
  >
    {submitting && <span className="btn-loader"></span>}
    {submitting 
      ? "Processing..." 
      : editingId 
        ? "Save Changes" 
        : "Publish Listing"
    }
  </button>

  <button 
    type="button" 
    className="luxe-cancel-btn" 
    onClick={() => setView("dashboard")}
  >
    Discard
  </button>
</div>
    </form>
  </section>
)}
      </main>

      {/* --- DETAILS MODAL --- */}
      {selectedRequest && (
        <div className="luxe-modal-overlay">
          <div className="luxe-modal-content">
            <button className="modal-close" onClick={() => setSelectedRequest(null)}><X size={20}/></button>
            <div className="modal-header">
              <h2>Request Details</h2>
              <p>Applicant: <strong>{selectedRequest.formData.fullName}</strong></p>
            </div>
            <div className="details-body" style={{lineHeight: '2'}}>
               <p><strong>Occupation:</strong> {selectedRequest.formData.occupation}</p>
               <p><strong>Move-in Date:</strong> {new Date(selectedRequest.formData.moveInDate).toLocaleDateString()}</p>
               <p><strong>Phone:</strong> {selectedRequest.formData.phone}</p>
               <div style={{background: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '10px', borderLeft: '4px solid #cbd5e1'}}>
                 <strong>Message:</strong> "{selectedRequest.formData.message || "No message"}"
               </div>
            </div>
          </div>
        </div>
      )}


      {/* /* --- 2. THE PROFILE SECTION (To be placed after {view === "add-property"} block) --- */}
{view === "profile" && (
  <section className="section-fade">
    <div className="form-container-luxe">
      <div className="form-header-luxe">
        <h2 className="content-heading">Account Profile</h2>
        <p className="luxe-subtitle">Manage your personal information and account security.</p>
      </div>

      <div className="profile-grid" style={{ marginTop: '30px' }}>
        <div className="form-section">
          <label className="section-label-luxe"><User size={16} /> Personal Details</label>
          
          <div className="profile-details-list" style={{ display: 'grid', gap: '20px' }}>
            <div className="detail-item">
              <label className="mini-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                Full Name
              </label>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-navy)', margin: '5px 0' }}>
                {user?.name || "JB Sindhasi"}
              </p>
            </div>

            <div className="detail-item">
              <label className="mini-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-navy)', margin: '5px 0' }}>
                {user?.email || "No Email Provided"}
              </p>
            </div>

            <div className="detail-item">
              <label className="mini-label" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                Account Type
              </label>
              <p>
                <span className="badge-status approved" style={{ fontSize: '0.7rem' }}>Verified Owner</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions-luxe" style={{ borderTop: '1px solid #eee', marginTop: '40px' }}>
        <button 
          className="luxe-cancel-btn" 
          onClick={() => setView("dashboard")}
        >
          Back to Overview
        </button>
      </div>
    </div>
  </section>
)}
      <Footer />
    </div>
  );
}