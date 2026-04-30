const express = require("express");
const Task = require("../models/Task");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE TASK
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      dueDate
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate({
        path: "projectId",
        select: "name description teamLead members createdBy",
        populate: [
          { path: "teamLead", select: "name email role" },
          { path: "members", select: "name email role" },
          { path: "createdBy", select: "name email role" }
        ]
      });

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET TASKS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate({
        path: "projectId",
        select: "name description teamLead members createdBy",
        populate: [
          { path: "teamLead", select: "name email role" },
          { path: "members", select: "name email role" },
          { path: "createdBy", select: "name email role" }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE TASK STATUS
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    )
      .populate("assignedTo", "name email role")
      .populate({
        path: "projectId",
        select: "name description teamLead members createdBy",
        populate: [
          { path: "teamLead", select: "name email role" },
          { path: "members", select: "name email role" },
          { path: "createdBy", select: "name email role" }
        ]
      });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;