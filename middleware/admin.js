const payload = require('./payload')
module.exports = function (req, res, next) {
  if (!req.user.isAdmin)
    return res.status(403).send(payload('Access denied', null, 'Forbidden'));
  next();
};
