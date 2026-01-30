const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    city: String,
    state: String,
    location:String
  },
  amenities: [{
    type: String
  }],
  price: {
    type: Number,
    required: true
  },
  availableRooms: {
    type: Number,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  images: [{
    type: String
  }],
  rules: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PG', pgSchema);