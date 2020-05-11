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
  password: { type: String, required: [true, "Password field is required"], min: 5, max: 256 },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_KEY
  );
};

const validateUserRequired = user => {
  const { name, email, password } = user
  const errors = {};
  let isValid = true;

  errors.name = (() => {
    const nameSchema = Joi.object({ name: Joi.string().min(3).max(50).required() });
    const { error } = nameSchema.validate({ name });
    if (error) {
      isValid = false
      return error.details[0].message
    };
  })()

  errors.email = (() => {
    const emailSchema = Joi.object({ email: Joi.string().email().required() });
    const { error } = emailSchema.validate({ email });
    if (error) {
      isValid = false
      return error.details[0].message
    };
  })()

  errors.password = (() => {
    const passwordSchema = Joi.object({ password: Joi.string().min(5).max(225).required() });
    const { error } = passwordSchema.validate({ password });
    if (error) {
      isValid = false
      return error.details[0].message
    };
  })()

  return ({ error: !isValid ? errors : null });
};

const validateUser = user => {
  const { name, email, password } = user
  const errors = {};
  let isValid = true;

  errors.name = (() => {
    const nameSchema = Joi.object({ name: Joi.string().min(3).max(50) });
    const { error } = nameSchema.validate({ name });
    if (error) {
      isValid = false
      return error.details[0].message
    };
  })()

  errors.email = (() => {
    const emailSchema = Joi.object({ email: Joi.string().email() });
    const { error } = emailSchema.validate({ email });
    if (error) {
      isValid = false
      return error.details[0].message
    };
  })()

  errors.password = (() => {
    const passwordSchema = Joi.object({ password: Joi.string().min(5).max(225) });
    const { error } = passwordSchema.validate({ password });
    if (error) {
      isValid = false
      return error.details[0].message
    };
  })()

  return ({ error: !isValid ? errors : null });
};

module.exports = mongoose.model("User", userSchema);
module.exports.validateUserRequired = validateUserRequired;
module.exports.validateUser = validateUser;
