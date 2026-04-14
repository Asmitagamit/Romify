const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to your User collection
    required: true
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PG", // Links to your PG collection
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model("Review", reviewSchema);