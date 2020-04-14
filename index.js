const express = require("express");
const app = express();
const post = require("./routes/post");
const user = require("./routes/user");
const pageNotFound = require("./routes/404");

app.use(express.json());

// Routes
app.use("/api/post", post);
app.use("/api/user", user);
app.use(pageNotFound);

// Listen to Port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
