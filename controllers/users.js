const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      res.status(200).send({ data: users });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user._id;
  User.findOne(_id)
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError' || err.name === 'ResourceNotFound') {
        next(new BadRequestError('Пользователь не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else if (err.name === 'ResourceNotFound') {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  User.findOne({ email })// отрабатывает ли проверка?
    .then((mail) => {
      if (mail) {
        throw new ConflictError('Пользователь с таким email уже существует.');
      } else {
        bcrypt.hash(req.body.password, 10)
          .then((hash) => User.create({
            name, about, avatar, email, password: hash,
          }))
          .then(() => {
            res.status(200).send({
              name, about, avatar, email,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'DuplicateKeyError' || err.name === 'RangeError') {
        next(new ConflictError('Пользователь с таким email уже существует.'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

// Мы рекомендуем записывать JWT в httpOnly куку
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('Ошибка аутентификации.'));
      }
      // аутентификация успешна! пользователь в переменной user
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );
      // return res.cookie('jwt', token, {
      //   // token - наш JWT токен, который мы отправляем
      //   maxAge: 3600000 * 24 * 7,
      //   httpOnly: true,
      //   sameSite: false,
      //   secure: true,
      // })
      // вернём токен
      res.status(200).send({ access_token: token });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new UnauthorizedError('Ошибка аутентификации.'));
      } else {
        next(err);
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }) //  { runValidators: true }
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    .then(() => {
      res.status(200).send(req.body);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }) //  { runValidators: true }
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      res.status(200).send(req.body);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Пользователь по указанному _id не найден.'));
      } else {
        next(err);
      }
    });
};
