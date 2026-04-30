const express = require("express");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔓 Only logged-in users
router.get("/user", authMiddleware, (req, res) => {
  res.json({
    message: "User access granted",
    user: req.user
  });
});

// 🔒 Only admin
router.get("/admin", authMiddleware, isAdmin, (req, res) => {
  res.json({
    message: "Admin access granted"
  });
});

module.exports = router;