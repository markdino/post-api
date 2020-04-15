const mongoose = require("mongoose");
const { commentSchema } = require("./comment");

mongoose.connect("mongodb://localhost/post", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: { type: String, required: [true, "Message field is reuired"] },
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [commentSchema]
});

module.exports = mongoose.model("Post", postSchema);
