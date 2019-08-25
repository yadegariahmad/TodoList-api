const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { errorHandler } = require('../util/misc');
const respondModel = require('../util/responseModel');

exports.signup = (req, res, next) =>
{
  const { email } = req.body;
  const { name } = req.body;
  const { password } = req.body;

  User.findOne({ email }).then(userDoc =>
  {
    if (userDoc)
    {
      const respond = new respondModel({}, 409, 'E-Mail address already exists!');
      res.json(respond);

    } else
    {
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
          const respond = new respondModel({ userId: result._id }, 201, 'User created!');
          res.json(respond);
        })
        .catch(err =>
        {
          err = errorHandler(err);

          next(err);
        });
    }
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
        const respond = new respondModel({}, 404, 'A user with this email could not be found.');
        res.json(respond);
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual =>
    {
      if (!isEqual)
      {
        const respond = new respondModel({}, 401, 'Wrong password!');
        res.json(respond);
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        'somesupersecretsecret',
      );

      const respond = new respondModel({ token, userId: loadedUser._id.toString() }, 200, '');
      res.json(respond);
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}
