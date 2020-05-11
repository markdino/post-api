const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const auth = require("../middleware/auth");
const payload = require("../middleware/payload");

// Add/remove like to post
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).send(payload("Post not found.", null, 'Not found'));

    const user = post.likes.find(like => like.user.toString() === req.user._id);
    const liked = user ? false : true;

    !user
      ? post.likes.push({ user: req.user._id })
      : (post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id
      ));

    await post.save();
    res.send(
      payload(null, { liked, length: post.likes.length }, liked ? 'Like' : 'Unlike')
    );
  } catch (err) {
    res.status(400).send(payload('Invalid ID.', null, "Bad request!"));
  }
});

module.exports = router;
