const express = require("express");
const router = express.Router();
const payload = require("../middleware/payload");

router.get("*", (req, res) => {
  res.status(404).send(payload("Page Not Found!", null, 404));
});

module.exports = router;
