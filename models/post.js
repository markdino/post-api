const mongoose = require("mongoose");
const { commentSchema } = require("./comment");

mongoose.connect("mongodb://localhost/post", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  message: { type: String, require: [true, "Message field is reuired"] },
  date: { type: Date, default: Date.now },
  likes: Number,
  comments: [commentSchema]
});

module.exports = mongoose.model("Post", postSchema);
