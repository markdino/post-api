const auth = require("../routes/auth");
const like = require("../routes/like");
const comment = require("../routes/comment");
const post = require("../routes/post");
const user = require("../routes/user");
const pageNotFound = require("../routes/404");
const compression = require("compression");
const helmet = require("helmet");

module.exports = app => {
    app.use("/api/post", like);
    app.use("/api/post", comment);
    app.use("/api/post", post);
    app.use("/api/user", user);
    app.use("/api/auth", auth);
    app.use(pageNotFound);
    app.use(helmet())
    app.use(compression())
}