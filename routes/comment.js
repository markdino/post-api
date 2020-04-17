const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const { Comment } = require("../models/comment");

// Add comment to the post
router.post("/:id/comment", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await Comment.create(req.body);
    post.comments.push(comment);
    post.save();
    res.send(comment);
  } catch {
    res.status(400).send("Bad request!");
  }
});

// Delete comment in the post
router.delete("/:id/comment/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.id(req.params.commentId);
    comment.remove();
    post.save();
    res.send(comment);
  } catch {
    res.status(400).send("Bad request!");
  }
});

module.exports = router;
