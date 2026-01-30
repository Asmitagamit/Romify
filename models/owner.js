const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  credentials: {
    username: String,
    password: String,
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG'
    },
  },
  address: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('owner', ownerSchema);