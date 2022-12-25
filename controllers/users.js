const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
require('dotenv').config();
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      // if (!users) {
      //   next(new NotFoundError('Пользователь по указанному _id не найден.'));
      // }
      res.status(200).send({ data: users });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user._id;
  console.log(req.user._id);
  console.log({ _id });
  User.findById(req.user._id)
    // .orFail(() => {
    //   next(new NotFoundError('Пользователь по указанному _id не найден.'));
    // })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      // if (err.name === 'CastError' || err.name === 'ValidationError'
      // || err.name === 'ResourceNotFound') {
      //   next(new BadRequestError('Пользователь не найден.'));
      // } else {
      next(err);
      // }
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
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  // User.findOne({ email })
  //   .then(() => {
  //     // if (mail) {
  //     //   next(new ConflictError('Пользователь с таким email уже существует.'));
  //     // } else {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then(() => {
      res.status(200).send({
        name, about, avatar, email,
      });
    })
    // })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует.'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные.'));
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
        return next(new UnauthorizedError('Ошибка аутентификации.'));
      }
      // аутентификация успешна! пользователь в переменной user
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev_secret',
        // 'some-secret-key',
        { expiresIn: '7d' },
      );
      console.log(JWT_SECRET);
      // return res.cookie('jwt', token, {
      //   // token - наш JWT токен, который мы отправляем
      //   maxAge: 3600000 * 24 * 7,
      //   httpOnly: true,
      //   sameSite: false,
      //   secure: true,
      // })
      res.status(200).send({ token });
      return res.end();
    })
    .catch((err) => {
      // if (err.name === 'CastError') {
      //   next(new UnauthorizedError('Ошибка аутентификации.'));
      // }
      next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      next(new NotFoundError('Пользователь по указанному _id не найден.'));
    })
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные.'));
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные.'));
      } else {
        next(err);
      }
    });
};
