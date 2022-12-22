const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const JWT_SECRET = require('../config');

module.exports = (req, res, next) => {
  // тут будет вся авторизация
  // достаём авторизационный заголовок
  // const { authorization } = req.header;
  // убеждаемся, что он есть или начинается с Bearer
  // if (!authorization || !authorization.startsWith('Bearer ')) {
  console.log(req.cookies.jwt);
  // if (!jwtCookies) {
  //   throw new ForbiddenError({ message: 'Такого пользователя не существует.' });
  // }
  // извлечём токен
  // const token = authorization.replace('Bearer ', '');

  const token = req.cookies.jwt;
  if (!token) {
    throw new UnauthorizedError('Необходима авторизация.');
  }
  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new UnauthorizedError('Такого пользователя не существует.'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
