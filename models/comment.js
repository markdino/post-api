const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: { type: String, required: [true, "Message field is reuired"] },
  date: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

exports.commentSchema = commentSchema;
exports.Comment = Comment;
