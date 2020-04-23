require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name field is required"] },
  email: {
    type: String,
    required: [true, "Email field is required"],
    unique: true
  },
  password: { type: String, required: [true, "Password field is required"] },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_KEY
  );
};

const validateUserRequired = user => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(225)
      .required()
  });

  return schema.validate(user);
};

const validateUser = user => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(50),
    email: Joi.string().email(),
    password: Joi.string()
      .min(5)
      .max(225)
  });

  return schema.validate(user);
};

const User = mongoose.model("User", userSchema);
module.exports = {
  User,
  validateUserRequired,
  validateUser
};
