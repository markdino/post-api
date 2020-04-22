const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// View all users
router.get("/", auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");

  User.find()
    .sort({ name: 1 })
    .select("-password -__v")
    .then(result => res.send(result))
    .catch(err => res.status(404).send(err.message));
});

// Get current user
router.get("/me", auth, (req, res) => {
  User.findById(req.user._id)
    .select("-password -__v")
    .then(response => res.send(response))
    .catch(err => res.send(404).send(err.message));
});

// View single user
router.get("/:id", auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");

  User.findOne({ _id: req.params.id })
    .select("-password -__v")
    .then(result => res.send(result))
    .catch(() => res.status(404).send("User Not Found!"));
});

// Save new user
router.post("/", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = _.pick(req.body, ["name", "email", "password"]);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  User.create(user)
    .then(response => {
      const token = response.generateAuthToken();
      res
        .header("x-auth-token", token)
        .send(_.pick(response, ["_id", "name", "email"]));
    })
    .catch(err => res.status(400).send(err.message));
});

// Update user
router.put("/:id", auth, async (req, res) => {
  if (req.user._id !== req.params.id)
    return res.status(403).send("Access denied!");

  const user = _.pick(req.body, ["name", "email", "password"]);
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  User.updateOne({ _id: req.params.id }, { $set: user })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Delete user
router.delete("/:id", auth, (req, res) => {
  if (req.user._id !== req.params.id)
    return res.status(403).send("Access denied!");
  User.deleteOne({ _id: req.params.id })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Make user an admin
router.post("/admin", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");
  try {
    const user = await User.findOne({ email: req.body.email });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.send(_.pick(user, ["_id", "name", "email", "isAdmin"]));
  } catch {
    res.status(400).send("Bad request!");
  }
});

module.exports = router;
