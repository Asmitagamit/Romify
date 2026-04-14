const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const PG = require("../models/pg");


exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user ONLY ONCE
    // Password hashing happens in User model pre("save")
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    

    // Access token
    const accessToken = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
    const refreshToken = jwt.sign(
  { id: user._id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "1d" }
);


  res.status(200).json({
  accessToken,
  refreshToken,
  user: {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  }
});
    

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

 //forgotpassword//

 exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    res.json({
      message: "Reset token generated",
      resetLink: `http://localhost:5173/reset-password/${resetToken}`
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//reset password//

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Password hashing happens in User model pre("save")
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

//..................auto refresh token generetaion...........................//
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ message: "Refresh token expired. Login again." });
  }
};