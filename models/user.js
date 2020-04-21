require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
