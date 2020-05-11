const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: { type: String, required: [true, "Message field is reuired"] },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
module.exports.commentSchema = commentSchema;

