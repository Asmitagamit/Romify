import React, { useState } from "react";
import "../styles/login.css";
import logo from "../assets/original.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
        const { accessToken, refreshToken, user } = res.data;
        
        localStorage.setItem("token", accessToken || res.data.token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setServerError("");
        setShowForgot(false);

        if (user.role === "owner") {
          navigate("/owner-dashboard", { replace: true });
        } else {
          navigate("/client-dashboard", { replace: true });
        }
      } catch (error) {
        const message = error.response?.data?.message || "Login failed";
        setServerError(message);
        setShowForgot(message.toLowerCase().includes("password"));
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo centered inside the box */}
        <div className="login-logo">
          <img src={logo} alt="Roomify Logo" />
        </div>

        <h2 className="login-title">Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <label>Email or Phone</label>
          <input
            type="text"
            placeholder="name@example.com"
            className={`login-input ${errors.email ? "error-input" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`login-input ${errors.password ? "error-input" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errors.password && <p className="error-text">{errors.password}</p>}
          {serverError && <p className="error-text">{serverError}</p>}

          {showForgot && (
            <p className="forgot-password-text" onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </p>
          )}

          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="signup-text">
          Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;