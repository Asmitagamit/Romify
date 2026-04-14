const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  ownerDeleted: { type: Boolean, default: false },
  clientDeleted: { type: Boolean, default: false }, // Fixed trailing comma/comment issue
  
  formData: {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        lowercase: true, 
        trim: true 
    },
    occupation: { type: String, required: true },
    moveInDate: { type: Date, required: true },
    stayDuration: { type: String, required: true },
    message: { type: String, trim: true }
  },
  requestedAt: { type: Date, default: Date.now },
  
  // Receipt details for approved requests
  receipt: {
    billBreakdown: {
      water: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      wifi: { type: Number, default: 0 },
      cleaning: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      rent: { type: Number, default: 0 }
    },
    totalAmount: { type: Number, default: 0 },
    generatedAt: { type: Date },
    receiptUrl: { type: String } // PDF receipt URL
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Request', RequestSchema);