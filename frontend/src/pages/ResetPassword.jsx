import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../styles/resetpassword.css";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(
      `http://localhost:3000/api/auth/reset-password/${token}`,
      { password }
    );

    alert("Password reset successful");
  };
return (
  <div className="reset-container">
    <div className="reset-box">
      <h2 className="reset-title">Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          className="reset-input"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="reset-btn">
          Reset Password
        </button>
      </form>
    </div>
  </div>
);

}

export default ResetPassword;
