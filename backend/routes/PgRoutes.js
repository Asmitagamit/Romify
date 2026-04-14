const express = require("express");
const router = express.Router();
const { protect, ownerOnly } = require("../Middleware/auth.js");
const multer = require("multer");
const { storage } = require("../config/cloudinary.js");
const upload = multer({ storage });
const PG = require("../models/pg");
const cloudinary = require("cloudinary").v2;
const pgController = require("../controllers/pgcontroller");

// ==========================================
// 1. SPECIFIC GET ROUTES (MUST BE AT TOP)
// ==========================================

// ✅ Get all PGs (Public)
router.get("/all", pgController.getAllPGs || (async (req, res) => {
  try {
    const pgs = await PG.find().sort({ createdAt: -1 });
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}));

// ✅ Get My Favorites (Protected) - MOVED UP TO PREVENT 500 ERROR
router.get("/favorites/me", protect, pgController.getFavorites);

// ✅ Get Logged-in Owner's PGs
router.get("/my-pgs", protect, ownerOnly, async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }); // Using _id from protect middleware
    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get PGs by Owner ID
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.params.ownerId }).sort({ createdAt: -1 });
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching PGs" });
  }
});

// ==========================================
// 2. DYNAMIC PARAMETER ROUTES (/:id)
// ==========================================

// // ✅ Show Single PG
// router.get("/:id", async (req, res) => {
//   try {
//     const pg = await PG.findById(req.params.id).populate("owner", "name email");

//     if (!pg) {
//       return res.status(404).json({ message: "PG not found" });
//     }
//     res.json(pg);
//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     res.status(500).json({ message: "Invalid ID format or Server Error" });
//   }
// });
router.get("/:id", pgController.getPgById);

// ==========================================
// 3. POST / PUT / DELETE ACTIONS
// ==========================================

// ✅ Create PG
router.post("/", protect, ownerOnly, upload.array("images", 5), pgController.createPg);

// ✅ Toggle Favorite
router.post("/:id/favorite", protect, pgController.toggleFavorite);

// ✅ Delete PG
router.delete("/:id", protect, ownerOnly, pgController.deletePG);

// ✅ Update PG
router.put("/:id", protect, ownerOnly, upload.array("images", 5), async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) return res.status(404).json({ message: "PG not found" });

    // Owner check (using req.user._id from middleware)
    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Parse existing images
    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = typeof req.body.existingImages === 'string' 
        ? JSON.parse(req.body.existingImages) 
        : req.body.existingImages;
    }

    // Delete removed images from Cloudinary
    const deletedImages = pg.images.filter(
      (img) => !existingImages.some((e) => e.public_id === img.public_id)
    );

    for (let img of deletedImages) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    // Add new images
    const newImages = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename,
    })) || [];

    pg.images = [...existingImages, ...newImages];

    // Safely parse JSON fields
    const parseField = (field) => req.body[field] ? JSON.parse(req.body[field]) : pg[field];
    
    pg.amenities = parseField('amenities');
    pg.furnishings = parseField('furnishings');
    pg.services = parseField('services');
    pg.safety = parseField('safety');

    // Update basic fields
    pg.name = req.body.name || pg.name;
    pg.price = req.body.price || pg.price;
    pg.totalRooms = req.body.totalRooms || pg.totalRooms;
    pg.availableRooms = req.body.availableRooms || pg.availableRooms;
    pg.description = req.body.description || pg.description;

    await pg.save();
    res.json(pg);

  } catch (error) {
    console.error("UPDATE PG ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add Review (Protected)
router.post("/:id/reviews", protect, pgController.addReview);


module.exports = router;