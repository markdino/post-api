require("dotenv").config();
const jwt = require("jsonwebtoken");
const payload = require("./payload");

module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .send(payload("Access denied! No token provided", null, "Unauthorized"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send(payload("Invalid token", null, ex.name));
  }
};
