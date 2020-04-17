const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");

// View all post
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: 1 })
    .select("-__v -comments.__v")
    .populate("author", "name")
    .then(result => res.send(result))
    .catch(err => res.status(404).send(err.message));
});

// View single post
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .select("-__v -comments.__v")
    .populate("author comments.user likes.user", "name")
    .then(result => res.send(result))
    .catch(() => res.status(404).send("Page not found or invalid post route!"));
});

// View post by author
router.get("/author/:authorId", (req, res) => {
  Post.find({ author: req.params.authorId })
    .sort({ date: 1 })
    .select("-__v -author")
    .then(result => res.send(result))
    .catch(() => res.status(404).send("Author not found or invalid ID"));
});

// Save new post
router.post("/", (req, res) => {
  User.findById(req.body.author).then(response => {
    if (response) {
      Post.create(req.body)
        .then(response => {
          const { _id, author, message, date } = response;
          res.send({ _id, author, message, date });
        })
        .catch(err => res.status(400).send(err.message));
    } else {
      res.status(400).send("Bad Request: Invalid User");
    }
  });
});

// Update post
router.put("/:id", (req, res) => {
  Post.updateOne({ _id: req.params.id }, { $set: req.body })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Delete post
router.delete("/:id", (req, res) => {
  Post.deleteOne({ _id: req.params.id })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Delete all post by author
router.delete("/author/:authorId", (req, res) => {
  Post.deleteMany({ author: req.params.authorId })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

module.exports = router;
