const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  },

  requestedRole: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  },

  approvalStatus: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "approved"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);