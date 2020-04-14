const express = require("express");
const router = express.Router();
const User = require("../models/user");

// View all users
router.get("/", (req, res) => {
  User.find()
    .sort({ name: 1 })
    .select("-password -__v")
    .then(result => res.send(result))
    .catch(err => console.log(err.message));
});

// View single user
router.get("/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password -__v")
    .then(result => res.send(result))
    .catch(() =>
      res.status(404).send({
        Error: { code: 404, status: "Not Found", message: "User Not Found!" }
      })
    );
});

// Save new user
router.post("/", (req, res) => {
  User.create(req.body)
    .then(response => {
      const { _id, name, email } = response;
      res.send({ _id, name, email });
    })
    .catch(err => res.status(400).send(err.message));
});

// Update user
router.put("/:id", (req, res) => {
  User.updateOne({ _id: req.params.id }, { $set: req.body })
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
