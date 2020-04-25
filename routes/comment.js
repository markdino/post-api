const express = require("express");
const router = express.Router();
const { Post, validateMessage } = require("../models/post");
const { Comment } = require("../models/comment");
const auth = require("../middleware/auth");
const payload = require("../middleware/payload");

// Add comment to the post
router.post("/:id/comment", auth, async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error.details[0].message, null, "Bad request!"));

  try {
    const post = await Post.findById(req.params.id);
    const comment = await new Comment({
      user: req.user._id,
      message: req.body.message
    });
    post.comments.push(comment);
    post.save();
    res.send(payload(null, comment, "New comment added."));
  } catch (err) {
    res.status(400).send(payload(err.message, null, "Bad request!"));
  }
});

// Delete comment in the post
router.delete("/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.id(req.params.commentId);
    const critic = comment.user;
    if (critic.toString() !== req.user._id)
      return res.status(403).send(payload("Access denied!", null, "Forbidden"));

    comment.remove();
    post.save();
    res.send(payload(null, comment, "Comment has been deleted"));
  } catch (err) {
    res.status(400).send(payload(err.message, null, "Bad request!"));
  }
});

module.exports = router;
