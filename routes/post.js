const express = require("express");
const router = express.Router();
const { Post, validateMessage } = require("../models/post");
const _ = require("lodash");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const payload = require("../middleware/payload");

// View all post
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: 1 })
    .select("-__v -comments.__v -comments.message")
    .populate("author", "name")
    .then(result =>
      res.send(
        payload(null, result, result.length ? "Posts." : "No post found.")
      )
    )
    .catch(err =>
      res.status(404).send(payload(err.message, null, "Bad request!"))
    );
});

// View single post
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .select("-__v -comments.__v")
    .populate("author comments.user likes.user", "name")
    .then(result => {
      result
        ? res.send(payload(null, result, "Post."))
        : res.status(404).send(payload("Post not found.", null, "Not found."));
    })
    .catch(() =>
      res
        .status(400)
        .send(
          payload("Page not found or invalid post route!", null, "Bad request!")
        )
    );
});

// View post by author
router.get("/author/:authorId", (req, res) => {
  Post.find({ author: req.params.authorId })
    .sort({ date: 1 })
    .select("-__v -author")
    .then(result =>
      res.send(
        payload(null, result, result.length ? "Posts." : "No post found.")
      )
    )
    .catch(() =>
      res
        .status(404)
        .send(payload("Author not found or invalid ID", null, "Bad request!"))
    );
});

// Save new post
router.post("/", [auth, admin], (req, res) => {
  const { error } = validateMessage(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error.details[0].message, null, "Bad request!"));

  req.body.author = req.user._id;
  Post.create(req.body)
    .then(response =>
      res.send(
        payload(
          null,
          _.pick(response, ["_id", "author", "message", "date"]),
          "New post added."
        )
      )
    )
    .catch(err =>
      res.status(400).send(payload(err.message, null, "Bad request!"))
    );
});

// Update post
router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error.details[0].message, null, "Bad request!"));

  const post = await Post.findById(req.params.id);
  if (req.user._id !== post.author.toString())
    return res.status(403).send(payload("Access denied!", null, "Forbidden"));

  req.body.date = Date.now();
  Post.updateOne({ _id: req.params.id }, { $set: req.body })
    .then(response =>
      res.send(
        payload(
          null,
          `${response.nModified} post has been modified`,
          "Update post"
        )
      )
    )
    .catch(err =>
      res.status(400).send(payload(err.message, null, "Bad request!"))
    );
});

// Delete post
router.delete("/:id", [auth, admin], async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post)
    return res
      .status(404)
      .send(payload("This post has already been deleted.", null, "Not found"));
  if (req.user._id !== post.author.toString())
    return res.status(403).send(payload("Access denied!", null, "Forbidden"));

  Post.deleteOne({ _id: req.params.id })
    .then(response =>
      res.send(
        payload(
          null,
          `${response.deletedCount} post has been deleted.`,
          "Delete post"
        )
      )
    )
    .catch(err => res.status(400).send(payload(err.message, null, err.name)));
});

// Delete all post by author
router.delete("/author/:authorId", [auth, admin], (req, res) => {
  if (req.user._id !== req.params.authorId)
    return res.status(403).send(payload("Access denied!", null, "Forbidden"));

  Post.deleteMany({ author: req.params.authorId })
    .then(response =>
      res.send(
        payload(
          null,
          `${response.deletedCount} post has been deleted.`,
          "Delete post"
        )
      )
    )
    .catch(err => res.status(400).send(payload(err.message, null, err.name)));
});

module.exports = router;
