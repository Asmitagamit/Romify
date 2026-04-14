const PG = require("../models/pg");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Review = require('../models/reviews');


exports.getAllPGs = async (req, res) => {
  try {
    const pgs = await PG.find().sort({ createdAt: -1 });
    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties" });
  }
};



// ================= CREATE PG =================
exports.createPg = async (req, res) => {
  try {

    // Map uploaded images safely
    const images =
      req.files?.map((file) => ({
        url: file.path,
        // public_id: file.filename
        public_id: file.filename || file.path.split("/").pop().split(".")[0]

      })) || [];

    // Safely parse arrays from frontend
    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    const furnishings = req.body.furnishings ? JSON.parse(req.body.furnishings) : [];
    const services = req.body.services ? JSON.parse(req.body.services) : [];
    const safety = req.body.safety ? JSON.parse(req.body.safety) : [];

    const pg = new PG({
      ...req.body,
      owner: req.user._id, // using user id from middleware
      images,
      amenities,
      furnishings,
      services,
      safety
    });

    await pg.save();

    res.status(201).json(pg);

  } catch (error) {
    console.error("CREATE PG ERROR:", error);
    res.status(500).json({ message: "Failed to create PG" });
  }
};

// ================= UPDATE PG =================
exports.updatePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    // Authorization check
    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ FIX 1: Safely Parse existing images
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        // If it's already an array/object, use it. If it's a string, parse it.
        const parsed = typeof req.body.existingImages === "string" 
          ? JSON.parse(req.body.existingImages) 
          : req.body.existingImages;
        
        // Force it into an array format even if only 1 image exists
        existingImages = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("JSON Parse Error for existingImages:", e);
        existingImages = []; 
      }
    }

    // ✅ FIX 2: Cloudinary Cleanup Logic
    // Only delete from Cloudinary if the image exists in the DB but NOT in the incoming 'existingImages'
    const deletedImages = pg.images.filter(
      (img) => !existingImages.some((e) => e.public_id === img.public_id)
    );

    for (let img of deletedImages) {
      if (img.public_id) {
        console.log("Removing from Cloudinary:", img.public_id);
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // ✅ FIX 3: New Images Mapping
    const newImages = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename || file.path.split("/").pop().split(".")[0]
    })) || [];

    // Combine
    pg.images = [...existingImages, ...newImages];

    // ✅ FIX 4: Safety for empty updates
    // If user didn't change these fields, keep the old ones
    pg.name = req.body.name || pg.name;
    pg.description = req.body.description || pg.description;
    pg.price = req.body.price || pg.price;
    pg.availableRooms = req.body.availableRooms || pg.availableRooms;
    pg.totalRooms = req.body.totalRooms || pg.totalRooms;

    // ✅ FIX 5: Dynamic Array Parsing
    const parseArray = (data, fallback) => {
      if (!data) return fallback;
      try {
        return typeof data === "string" ? JSON.parse(data) : data;
      } catch (e) {
        return fallback;
      }
    };

    pg.amenities = parseArray(req.body.amenities, pg.amenities);
    pg.furnishings = parseArray(req.body.furnishings, pg.furnishings);
    pg.services = parseArray(req.body.services, pg.services);
    pg.safety = parseArray(req.body.safety, pg.safety);

    await pg.save();
    res.status(200).json(pg);

  } catch (error) {
    console.error("UPDATE PG ERROR DETAILS:", error); // Check your VS Code terminal for this!
    res.status(500).json({ message: "Error updating PG", error: error.message });
  }
};


exports.deletePG = async (req, res) => {
  try {

    const pg = await PG.findById(req.params.id);

    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }

    // Authorization check
    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }


    // Delete images from Cloudinary
    // for (let img of pg.images || []) {
    //   await cloudinary.uploader.destroy(img.public_id);
    // }
    
    for (let img of pg.images) {
  console.log("Deleting:", img.public_id);
  await cloudinary.uploader.destroy(img.public_id);
}

    // Delete PG
    await PG.findByIdAndDelete(req.params.id);

    res.json({ message: "PG and images deleted successfully" });

  } catch (error) {
    console.error("DELETE PG ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};


//===================FAVOURITES============================//

exports.toggleFavorite = async (req, res) => {
  try {
    // 1. Get the user from the database
    const user = await User.findById(req.user._id);
    const pg = await PG.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ THE GUARD: Only 'client' can like PGs
    if (user.role !== "client") {
      return res.status(403).json({ 
        message: "Only tenants/clients can add properties to favorites." 
      });
    }

    const pgId = req.params.id;
    const isFavorite = user.favorites.includes(pgId);

    if (isFavorite) {
      // Remove Logic
      user.favorites = user.favorites.filter(id => id.toString() !== pgId);
      pg.totalLikes = Math.max(0, (pg.totalLikes || 0) - 1);
    } else {
      // Add Logic
      user.favorites.push(pgId);
      pg.totalLikes = (pg.totalLikes || 0) + 1;
    }

    await user.save();
    await pg.save();
    
    res.json({ favorites: user.favorites, totalLikes: pg.totalLikes });

  } catch (error) {
    console.error("FAVORITE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    // 1. Ensure user exists
    const user = await User.findById(req.user._id).populate("favorites");
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Filter out nulls (in case a PG was deleted but still in user's list)
    const validFavorites = user.favorites.filter(pg => pg !== null);
    
    res.status(200).json(validFavorites);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching favorites" });
  }
};



// ================= ADD REVIEW =================
exports.addReview = async (req, res) => {
    try {
        const { rating, message } = req.body;
        const pgId = req.params.id;
        const userId = req.user._id; // Using _id from protect middleware

        // Optional: Check if user already reviewed
        const alreadyReviewed = await Review.findOne({ user: userId, pg: pgId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this property" });
        }

        const newReview = new Review({
            pg: pgId,
            user: userId,
            rating: Number(rating),
            message
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully!" });
    } catch (error) {
        console.error("ADD REVIEW ERROR:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ================= GET PG BY ID (With Reviews) =================
exports.getPgById = async (req, res) => {
    try {
        const pg = await PG.findById(req.params.id)
            .populate('owner', 'name email')
            .populate({
                path: 'reviews', // This links to the virtual field in your PG Schema
                populate: { path: 'user', select: 'name' } 
            });

        if (!pg) return res.status(404).json({ message: "PG not found" });
        res.json(pg);
    } catch (error) {
        console.error("GET PG ERROR:", error);
        res.status(500).json({ message: "Error fetching PG details" });
    }
};