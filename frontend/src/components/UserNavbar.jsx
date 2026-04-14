import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, LogOut, Home, HelpCircle, ChevronDown } from "lucide-react";
import "../styles/usernavbar.css";
import logo from "../assets/original.png";

export default function UserNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const displayName = user?.email
    ? user.email.split("@")[0].replace(/[0-9]/g, "")
    : "User";

  return (
    <nav className="luxe-dash-nav">
      <div className="nav-container-luxe">
        {/* LOGO & ROLE */}
        <div className="nav-left">
          <Link to="/" className="nav-logo-brand">
            <img src={logo} alt="Roomify" className="nav-brand-img" />
          </Link>
          <span className="nav-context-tag">
            {user?.role === "owner" ? "Owner Hub" : "Management Hub"}
          </span>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="nav-right" ref={dropdownRef}>
          <div className="profile-trigger" onClick={() => setOpen(!open)}>
            <div className="avatar-box">{displayName.charAt(0).toUpperCase()}</div>
            <div className="trigger-text">
              <span className="trigger-name">{displayName}</span>
              {/* <ChevronDown size={14} className={open ? "rotate-icon" : ""} /> */}
            </div>
          </div>

          {open && (
            <div className="luxe-dropdown-menu">
              <div className="dropdown-header">
                <div className="header-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <div className="header-info">
                  <p className="header-name">{displayName}</p>
                  <p className="header-email">{user?.email}</p>
                </div>
              </div>

              <ul className="dropdown-links">
                <li onClick={() => navigate("/")}>
                  <Home size={16} /> <span>Home Gallery</span>
                </li>
                <li onClick={() => navigate("/help")}>
                  <HelpCircle size={16} /> <span>Help & Support</span>
                </li>
                <div className="dropdown-separator"></div>
                <li className="logout-link" onClick={handleLogout}>
                  <LogOut size={16} /> <span>Sign Out</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}