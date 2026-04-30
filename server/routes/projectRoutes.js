const express = require("express");
const Project = require("../models/Project");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE PROJECT (Admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, description, teamLead, members } = req.body;

    if (!name || !description || !teamLead) {
      return res.status(400).json({
        message: "Project name, description and team lead are required"
      });
    }

    const finalMembers = Array.from(
      new Set([...(members || []), teamLead])
    );

    const project = new Project({
      name,
      description,
      teamLead,
      createdBy: req.user.id,
      members: finalMembers
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("teamLead", "name email role")
      .populate("members", "name email role");

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL PROJECTS (logged users)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("teamLead", "name email role")
      .populate("members", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROJECT TEAM (Admin only)
router.put("/:id/team", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { teamLead, members } = req.body;

    if (!teamLead) {
      return res.status(400).json({
        message: "Team lead is required"
      });
    }

    const finalMembers = Array.from(
      new Set([...(members || []), teamLead])
    );

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        teamLead,
        members: finalMembers
      },
      { returnDocument: "after" }
    )
      .populate("teamLead", "name email role")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;