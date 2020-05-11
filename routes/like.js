const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const auth = require("../middleware/auth");
const payload = require("../middleware/payload");

// Add/remove like to post
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = post.likes.find(like => like.user.toString() === req.user._id);
    const liked = user ? false : true;

    !user
      ? post.likes.push({ user: req.user._id })
      : (post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id
      ));

    await post.save();
    res.send(payload(null, { liked, length: post.likes.length }, liked));
  } catch (err) {
    res.status(400).send(payload(err.message, null, "Bad request!"));
  }
});

module.exports = router;
