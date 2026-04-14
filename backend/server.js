require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const pgRoutes = require("./routes/PgRoutes");
const requestRoutes = require("./routes/requestRoutes"); // IMPORT IT
const receiptRoutes = require("./routes/receiptRoutes");

const app = express();

//middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(methodOverride("_method"));

// Static Folder for Images
app.use("/uploads", express.static("uploads")); 


// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/pg", pgRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/receipts", receiptRoutes);


// app.use("/uploads", express.static("uploads"));


// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/rommify")
  .then(() => {
    console.log("Mongo Connected");
    // Import models after connection is established
    require("./models/User");
    require("./models/pg");
    require("./models/request");
    require("./models/Receipt");
  })
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});