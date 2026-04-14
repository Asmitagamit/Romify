import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";


function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",        // ✅ ADDED
    email: "",
    password: "",
    role: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      alert("Please select a role");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/signup",
        formData
      );

      const { accessToken, refreshToken, user } = res.data || {};
      if (accessToken) localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // 🚀 Direct redirect based on role
      if (formData.role === "owner") {
        navigate("/owner-dashboard");
      } else {
      navigate("/client-dashboard");
    }

    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };   // ✅ YOU WERE MISSING THIS LINE

return (
  <div className="signup-container">
    <div className="signup-box">
      <h2 className="signup-title">Create Account</h2>

      <form onSubmit={handleSubmit} className="signup-form">


       {/* ✅ NAME FIELD ADDED */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="owner">Owner</option>
          <option value="client">Client</option>
        </select>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  </div>
);

}

export default Signup;
