const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/post", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  name: { type: String, require: [true, "Name field is required"] },
  email: {
    type: String,
    require: [true, "Email field is required"],
    unique: true
  },
  password: { type: String, require: [true, "Password field is required"] },
  isAdmin: Boolean
});

module.exports = mongoose.model("User", userSchema);
