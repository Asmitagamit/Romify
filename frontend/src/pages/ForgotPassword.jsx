import { useState } from "react";
import axios from "axios";
import "../styles/forgotpassword.css";
import { useNavigate } from "react-router-dom";


function ForgotPassword() {
  const [email, setEmail] = useState("");
    const navigate = useNavigate();  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axios.post(
      "http://localhost:3000/api/auth/forgot-password",
      { email }
    );

     const resetLink = res.data.resetLink;
    const token = resetLink.split("/").pop();

    // 🔥 redirect to reset page
    navigate(`/reset-password/${token}`);
  };

  return (
  <div className="forgot-container">
    <div className="forgot-box">
      <h2 className="forgot-title">Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="forgot-input"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="forgot-btn">
          Send Reset Link
        </button>
      </form>
    </div>
  </div>
);

}

export default ForgotPassword;


//Rest password//


