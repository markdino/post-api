require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const auth = require("./routes/auth");
const like = require("./routes/like");
const comment = require("./routes/comment");
const post = require("./routes/post");
const user = require("./routes/user");
const pageNotFound = require("./routes/404");
const compression = require("compression");
const helmet = require("helmet");

// Database connection
mongoose.connect(process.env.DB_PATH, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.json());

// Routes
app.use("/api/post", like);
app.use("/api/post", comment);
app.use("/api/post", post);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use(pageNotFound);
app.use(helmet());
app.use(compression());

// Listen to Port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
