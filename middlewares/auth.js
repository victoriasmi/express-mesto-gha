const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('No authorization'));
  }
  console.log({ auth: authorization });

  const token = authorization.replace('Bearer ', '');
  console.log({ tok: token });
  console.log(JWT_SECRET);

  let payload;
  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(
      token,
      JWT_SECRET,
      // 'some-secret-key',
    );
    console.log({ pay: payload });
  } catch (err) {
    next(new UnauthorizedError('Такого пользователя не существует.'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  // res.end();
  next(); // пропускаем запрос дальше
};

// const { JWT_SECRET = 'dev_secret' } = process.env;
// !authorization.startsWith('Bearer ')
// const token = req.cookies.jwt;
// if (!jwtCookies) {
//   throw new ForbiddenError({ message: 'Такого пользователя не существует.' });
// }
