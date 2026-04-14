const jwt = require("jsonwebtoken");
const User = require("../models/User");



exports.protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Extract token safely
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Support BOTH id and _id (VERY IMPORTANT FIX)
    const userId = decoded.id || decoded._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid token",
    });
  }
};

exports.ownerOnly = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Owner access only" });
  }

  next();
};

exports.clientOnly = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Client access only" });
  }

  next();
};