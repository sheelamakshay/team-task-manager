const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const transporter = require("../config/mail");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,

      // ✅ IMPORTANT:
      // Admin request is saved as member first.
      // Only approval link changes role to admin.
      role: "member",
      requestedRole: role === "admin" ? "admin" : "member",
      approvalStatus: role === "admin" ? "pending" : "approved"
    });

    await user.save();

    // ADMIN REQUEST MAIL
    if (role === "admin") {
      const approveLink = `${process.env.BACKEND_URL}/api/auth/approve-admin/${user._id}`;
      const rejectLink = `${process.env.BACKEND_URL}/api/auth/reject-admin/${user._id}`;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.SUPERUSER_EMAIL,
          subject: "Admin Approval Request",
          html: `
            <h2>Admin Approval Request</h2>

            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p>This user requested admin access.</p>

            <a href="${approveLink}" 
               style="display:inline-block;padding:10px 15px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">
               Approve Admin
            </a>

            <br/><br/>

            <a href="${rejectLink}" 
               style="display:inline-block;padding:10px 15px;background:#dc2626;color:white;text-decoration:none;border-radius:6px;">
               Reject Request
            </a>
          `
        });
      } catch (mailError) {
        console.log("Admin approval mail failed:", mailError.message);

        return res.status(500).json({
          message: "Admin request saved, but approval email failed. Check EMAIL_USER, EMAIL_PASS and SUPERUSER_EMAIL."
        });
      }

      return res.status(201).json({
        message: "Admin request sent for approval"
      });
    }

    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // ✅ Block only admin requests while pending/rejected.
    if (user.requestedRole === "admin" && user.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your admin request is pending approval."
      });
    }

    if (user.requestedRole === "admin" && user.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your admin request was rejected."
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// APPROVE ADMIN REQUEST
router.get("/approve-admin/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.approvalStatus === "approved" && user.role === "admin") {
      return res.send("This user is already approved as admin.");
    }

    user.role = "admin";
    user.requestedRole = "admin";
    user.approvalStatus = "approved";

    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Admin Access Approved",
        html: `
          <h2>Admin Access Approved</h2>
          <p>Hello ${user.name},</p>
          <p>You are now approved as an admin.</p>
          <p>Please be cautious and work adhering to the application guidelines.</p>
        `
      });
    } catch (mailError) {
      console.log("Approval confirmation mail failed:", mailError.message);
    }

    return res.send("Admin request approved successfully.");

  } catch (error) {
    res.status(500).send(error.message);
  }
});

// REJECT ADMIN REQUEST
router.get("/reject-admin/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.approvalStatus === "rejected") {
      return res.send("This admin request is already rejected.");
    }

    user.role = "member";
    user.requestedRole = "admin";
    user.approvalStatus = "rejected";

    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Admin Access Request Rejected",
        html: `
          <h2>Admin Access Request Rejected</h2>
          <p>Hello ${user.name},</p>
          <p>Your admin access request has been rejected by the superuser.</p>
          <p>You may continue using the application as a member.</p>
        `
      });
    } catch (mailError) {
      console.log("Rejection mail failed:", mailError.message);
    }

    return res.send("Admin request rejected successfully.");

  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;