const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  address: {
    blockNo: { type: String, required: true },
    apartment: { type: String, required: true },
    locality: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  lat: Number,
  lng: Number,
  amenities: [{ type: String }],
  furnishings: [{ type: String }],
  services: [{ type: String }],
  safety: [{ type: String }],
  price: { type: Number, required: true },
  availableRooms: { type: Number, required: true },
  totalRooms: { type: Number, required: true },
  images: [{ url: String, public_id: String }],
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // 🟢 totalLikes moved INSIDE the Schema here
  totalLikes: {
    type: Number,
    default: 0
  },
  favorites: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }]
}, 
{ 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// The virtual link for reviews
pgSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'pg'
});

module.exports = mongoose.model('PG', pgSchema);