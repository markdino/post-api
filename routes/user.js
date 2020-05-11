const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User, validateUserRequired, validateUser } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const payload = require("../middleware/payload");

// View all users
router.get("/", [auth, admin], (req, res) => {
  User.find()
    .sort({ name: 1 })
    .select("-password -__v")
    .then(result =>
      res.send(
        payload(null, result, result.length ? "Users." : "No user found.")
      )
    )
    .catch(err =>
      res.status(400).send(payload(err.message, null, "Bad request!"))
    );
});

// Get current user
router.get("/me", auth, (req, res) => {
  User.findById(req.user._id)
    .select("-password -__v")
    .then(response => res.send(payload(null, response, "Current user.")))
    .catch(err =>
      res.status(404).send(payload(err.message, null, "Not found."))
    );
});

// View single user
router.get("/:id", [auth, admin], (req, res) => {
  User.findById(req.params.id)
    .select("-password -__v")
    .then(result => {
      result
        ? res.send(payload(null, result, "User"))
        : res.status(404).send(payload("User not found.", null, "Not found."));
    })
    .catch(ex =>
      res.status(404).send(payload(`Invalid ID. ${ex.value}`, null, ex.name))
    );
});

// Save new user
router.post("/", async (req, res) => {
  // Validate request user
  const { error } = validateUserRequired(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error, null, "Bad request!"));

  // Validate if user exist
  const user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .send(payload({ email: "Email already taken." }, null, "Bad request!"));

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  User.create(req.body)
    .then(response => {
      const token = response.generateAuthToken();
      const { _id, name, email } = response;
      res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .send(
          payload(null, { _id, name, email }, "New user has been registered.")
        );
    })
    .catch(err => res.status(400).send(payload(err.message, null, err.name)));
});

// Update user
router.put("/:id", auth, async (req, res) => {
  // Validate request user
  const { error } = validateUser(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error, null, "Bad request!"));

  if (req.user._id !== req.params.id)
    return res.status(403).send(payload("Access denied!", null, "Forbidden"));

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  User.updateOne({ _id: req.params.id }, { $set: req.body })
    .then(response =>
      res.send(
        payload(
          null,
          `${response.nModified} user has been modified`,
          "Update user"
        )
      )
    )
    .catch(err => res.status(400).send(payload(err.message, null, err.name)));
});

// Delete user
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user)
      return res.status(404).send(
        payload("User already been deleted.", null, 'Not found')
      );

    if (req.user._id !== req.params.id)
      return res.status(403).send(payload("Access denied!", null, "Forbidden"));

    const response = await user.deleteOne();
    const { _id, name, email } = response;
    if (response) res.send(payload(null, { _id, name, email }, 'Deleted user'));
  }
  catch {
    res.status(400).send(payload('Invalid user', null, 'Bad request'));
  }
});

// Make user an admin
router.post("/admin", [auth, admin], async (req, res) => {
  // Validate email
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
  });
  const { value, error } = schema.validate(req.body);
  if (error)
    return res
      .status(400)
      .send(payload(error.details[0].message, null, "Bad request!"));

  // Promote/demote user
  try {
    const user = await User.findOne(value).select("-password -__v");
    if (!user)
      return res
        .status(404)
        .send(payload('"email" not registered', null, "Not found"));

    user.isAdmin = !user.isAdmin;
    await user.save();
    res.send(
      payload(null, user, user.isAdmin ? "User is promoted" : "User is demoted")
    );
  } catch (ex) {
    res.status(400).send(payload(err.message, null, "Bad request!"));
  }
});

module.exports = router;
