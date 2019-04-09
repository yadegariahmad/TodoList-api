const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { errorHandler } = require('../util/misc');

exports.signup = (req, res, next) =>
{
  const { email } = req.body;
  const { name } = req.body;
  const { password } = req.body;

  bcrypt.hash(password, 12)
    .then(hashedPw =>
    {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name
      });
      return user.save();
    })
    .then(result =>
    {
      res.status(201).json({ message: 'User created!', userId: result._id });
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.login = (req, res, next) =>
{
  const { email } = req.body;
  const { password } = req.body;
  let loadedUser;

  User.findOne({ email })
    .then(user =>
    {
      if (!user)
      {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual =>
    {
      if (!isEqual)
      {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'somesupersecretsecret',
        { expiresIn: '1h' }
      );
      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}
