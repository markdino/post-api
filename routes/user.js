const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// View all users
router.get("/", (req, res) => {
  User.find()
    .sort({ name: 1 })
    .select("-password -__v")
    .then(result => res.send(result))
    .catch(err => res.status(404).send(err.message));
});

// View single user
router.get("/:id", (req, res) => {
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
router.put("/:id", async (req, res) => {
  const user = _.pick(req.body, ["name", "email", "password", "isAdmin"]);
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  User.updateOne({ _id: req.params.id }, { $set: user })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Delete user
router.delete("/:id", (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

module.exports = router;
