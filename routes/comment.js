const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const { Comment } = require("../models/comment");
const auth = require("../middleware/auth");

// Add comment to the post
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await new Comment({
      user: req.user._id,
      message: req.body.message
    });
    post.comments.push(comment);
    post.save();
    res.send(comment);
  } catch {
    res.status(400).send("Bad request!");
  }
});

// Delete comment in the post
router.delete("/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.id(req.params.commentId);
    const critic = comment.user;
    if (critic.toString() !== req.user._id)
      return res.status(401).send("Permission denied.");

    comment.remove();
    post.save();
    res.send(comment);
  } catch {
    res.status(400).send("Bad request!");
  }
});

module.exports = router;
