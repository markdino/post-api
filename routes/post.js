const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const _ = require("lodash");
const auth = require("../middleware/auth");

// View all post
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: 1 })
    .select("-__v -comments.__v -comments.message")
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
router.post("/", auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");

  req.body.author = req.user._id;
  Post.create(_.pick(req.body, ["author", "message", "date"]))
    .then(response =>
      res.send(_.pick(response, ["_id", "author", "message", "date"]))
    )
    .catch(err => res.status(400).send(err.message));
});

// Update post
router.put("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");

  const post = await Post.findOne({ _id: req.params.id });
  req.body.date = Date.now();

  if (req.user._id !== post.author.toString())
    return res.status(403).send("Access denied!");
  Post.updateOne(
    { _id: req.params.id },
    { $set: _.pick(req.body, ["date", "message"]) }
  )
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");

  const post = await Post.findOne({ _id: req.params.id });
  if (req.user._id !== post.author.toString())
    return res.status(403).send("Access denied!");

  Post.deleteOne({ _id: req.params.id })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

// Delete all post by author
router.delete("/author/:authorId", auth, (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied!");

  if (req.user._id !== req.params.authorId)
    return res.status(403).send("Access denied.");

  Post.deleteMany({ author: req.params.authorId })
    .then(response => res.send(response))
    .catch(err => res.status(400).send(err.message));
});

module.exports = router;
