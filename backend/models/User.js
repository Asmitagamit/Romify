const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    url: { type: String, default: "" },
    public_id: { type: String, default: "" }
  },
  role: {
    type: String,
    enum: ["owner", "client"],
    required: true
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG"
    }
  ],
  isVerified: {
    type: Boolean,
    default: false
  },
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });

// Hash passwords
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);