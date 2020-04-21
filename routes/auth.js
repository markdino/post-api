const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/", async (req, res) => {
  // Validate email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password!");
  // Validate password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password!");

  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
