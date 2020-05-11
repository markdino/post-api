const Joi = require("@hapi/joi");
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

const validateMessage = message => {
  const schema = Joi.object({
    message: Joi.string()
      .min(3)
      .required()
  });

  return schema.validate(message);
};

module.exports = mongoose.model("Post", postSchema);
module.exports.validateMessage = validateMessage;
