const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');
require('dotenv').config();

// const { JWT_SECRET = 'dev_secret' } = process.env;
const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // тут будет вся авторизация
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Нет authorization');
  }
  // !authorization.startsWith('Bearer ')
  // const token = req.cookies.jwt;
  // if (!jwtCookies) {
  //   throw new ForbiddenError({ message: 'Такого пользователя не существует.' });
  // }
  console.log({ auth: authorization });
  const token = authorization.replace('Bearer ', '');
  console.log({ tok: token });

  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(
      token,
      JWT_SECRET,
    );
    console.log({ pay: payload });
  } catch (err) {
    next(new UnauthorizedError('Такого пользователя не существует.'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  return next(); // пропускаем запрос дальше
};
