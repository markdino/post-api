const express = require("express");
const router = express.Router();
const Post = require("../models/post");

// Add like to post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = post.likes.find(
      like => like.user.toString() === req.body.user
    );
    const liked = user ? false : true;

    if (!user) {
      post.likes.push(req.body);
    } else {
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.body.user
      );
    }
    await post.save();
    res.send({ liked, length: post.likes.length });
  } catch {
    res.status(400).send("Bad request!");
  }
});

module.exports = router;
