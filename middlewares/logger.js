const winston = require('winston');
const expressWinston = require('express-winston');

// будем логировать два типа информации — запросы к серверу и ошибки, которые на нём происходят
// создадим логгер запросов
const requestLogger = expressWinston.logger({
  transports: [ // логи можно писать в консоль, в сторонний сервис аналитики, в файл
    new winston.transports.File({ filename: 'request.log' }),
  ],
  format: winston.format.json(), // json, потому что его удобно анализировать
});

// создадим логгер ошибок
// имя ошибки, сообщение и её стектрейс
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
  format: winston.format.json(),
});

module.exports = {
  requestLogger,
  errorLogger,
};
