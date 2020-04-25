const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const payload = require("../middleware/payload");

router.post("/", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error.details[0].message, null, "Bad request!"));

  // Validate email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send(payload("Invalid email or password!", null, "Login failed."));

  // Validate password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res
      .status(400)
      .send(payload("Invalid email or password!", null, "Login failed."));

  const token = user.generateAuthToken();
  res.send(payload(null, token, "Login success."));
});

module.exports = router;
