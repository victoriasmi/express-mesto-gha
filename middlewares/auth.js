const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // тут будет вся авторизация
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация.');
  }
  // !authorization.startsWith('Bearer ')
  // const token = req.cookies.jwt;
  // if (!jwtCookies) {
  //   throw new ForbiddenError({ message: 'Такого пользователя не существует.' });
  // }
  console.log(authorization);
  const token = authorization.replace('Bearer ', '');
  console.log(token);
  if (!token) {
    throw new UnauthorizedError('Необходима авторизация.');
  }
  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(
      token,
      // NODE_ENV === 'production' ? JWT_SECRET : 'dev_secret',
      JWT_SECRET,
    );
  } catch (err) {
    next(new UnauthorizedError('Такого пользователя не существует.'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};
