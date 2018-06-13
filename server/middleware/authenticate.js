const { User } = require('./../models/user');

const authenticate = (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject(); // will goto catch
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((err) => {
    res.send(401).send();
  });
};

module.exports = { authenticate };
