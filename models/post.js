const mongoose = require("mongoose");
const { commentSchema } = require("./comment");

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: { type: String, required: [true, "Message field is reuired"] },
  date: { type: Date, default: Date.now },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],
  comments: [commentSchema]
});

module.exports = mongoose.model("Post", postSchema);
