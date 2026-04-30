const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Task = require("../models/Task");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL USERS
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE USER - ADMIN CANNOT DELETE ANOTHER ADMIN
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot delete another admin"
      });
    }

    await User.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ assignedTo: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE USER CREDENTIALS
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: "after"
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER PERFORMANCE
router.get("/performance", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const performance = await Promise.all(
      users.map(async (user) => {
        const tasks = await Task.find({ assignedTo: user._id });

        const total = tasks.length;
        const completed = tasks.filter((task) => task.status === "done").length;
        const inProgress = tasks.filter(
          (task) => task.status === "in-progress"
        ).length;
        const todo = tasks.filter((task) => task.status === "todo").length;

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          total,
          completed,
          inProgress,
          todo,
          progress: total === 0 ? 0 : Math.round((completed / total) * 100)
        };
      })
    );

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;