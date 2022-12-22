module.exports = ((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });

  if (err.statusCode === 400) {
    res.status(400).send({ message: 'Некорректные данные.' });
  }

  // if (err.statusCode === 401) {
  //   res.status(401).send({ message: 'Необходима авторизация.' });
  // }
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});
