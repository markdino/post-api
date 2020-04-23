const Joi = require("@hapi/joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User, validateUserRequired, validateUser } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// View all users
router.get("/", [auth, admin], (req, res) => {
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
router.get("/:id", [auth, admin], (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password -__v")
    .then(result => res.send(result))
    .catch(() => res.status(404).send("User Not Found!"));
});

// Save new user
router.post("/", async (req, res) => {
  // Validate request user
  const { error } = validateUserRequired(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Validate if user exist
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  User.create(req.body)
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
  // Validate request user
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user._id !== req.params.id)
    return res.status(403).send("Access denied!");

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  User.updateOne({ _id: req.params.id }, { $set: req.body })
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
router.post("/admin", [auth, admin], async (req, res) => {
  // Validate email
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
  });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Promote/demote user
  try {
    const user = await User.findOne(value);
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.send(_.pick(user, ["_id", "name", "email", "isAdmin"]));
  } catch {
    res.status(400).send("Bad request!");
  }
});

module.exports = router;
