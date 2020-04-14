const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/post", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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

module.exports = mongoose.model("User", userSchema);
