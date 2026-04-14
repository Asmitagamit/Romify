import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Send } from "lucide-react";
import "../styles/requestform.css";

const RequestForm = ({ pg, user, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: user.name || "",
    phone: "",
    email: user.email || "",
    occupation: "",
    moveInDate: "",
    stayDuration: "",
    message: ""
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. Get the token from storage
  const token = localStorage.getItem("token"); 

  // 2. Check if token exists before even trying
  if (!token) {
    toast.error("Please login to send a request");
    return;
  }

  try {
    const userId = user?._id || user?.id;
    const ownerId = typeof pg.owner === "object" ? pg.owner._id : pg.owner;

    // 3. Add the Authorization Header
    const res = await axios.post(
      "http://localhost:3000/api/requests/send", 
      {
        pgId: pg._id,
        userId,
        ownerId,
        formData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 THIS IS THE MISSING KEY
        },
      }
    );

    toast.success("Request sent successfully!");
    onClose();
  } catch (err) {
    // If the token is expired or fake, the backend will send a 401
    toast.error(err.response?.data?.message || "Submission failed");
  }
};

  return (
    <div className="luxe-modal-overlay">
      <div className="luxe-modal-content">
        <button className="modal-close" onClick={onClose}><X size={20}/></button>
        <div className="modal-header">
          <h2>Secure Your Space</h2>
          <p>Send a direct inquiry to the owner of <strong>{pg.name}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="luxe-form">
          <div className="form-row">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={formData.fullName} required readOnly />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" required placeholder="+91 00000 00000"
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Current Occupation</label>
            <input type="text" required placeholder="e.g. Designer at Google"
              onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Preferred Move-in</label>
              <input type="date" required
                onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Planned Stay</label>
              <input type="text" required placeholder="e.g. 11 Months"
                onChange={(e) => setFormData({...formData, stayDuration: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label>Personal Message (Optional)</label>
            <textarea rows="3" placeholder="Tell the owner a bit about yourself..."
              onChange={(e) => setFormData({...formData, message: e.target.value})} />
          </div>

          <button type="submit" className="luxe-submit-btn">
            Send Inquiry <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;