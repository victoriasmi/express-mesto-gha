const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');
const BadRequestError = require('./errors/bad-request-err');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();
const { PORT = 3000 } = process.env;

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      // .email({ tlds: { allow: false } }),
      password: Joi.string().required(),
    }),
  }),
  login,
);

const method = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  } throw new BadRequestError('Некорректная ссылка.');
};

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().custom(method),
    }),
  }),
  createUser,
);

// авторизация
app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

// app.use((req, res) => {
//   res.status(401).send({ message: 'Необходима авторизация' });
// });

app.use(errors()); // обработчик ошибок celebrate
app.use(error);// централизованный обработчик ошибок

app.use((req, res, next) => {
  next(res.status(404).send({ message: 'Страница по указанному маршруту не найдена' }));
});

app.listen(PORT, () => {
  console.log(`app now listening to port ${PORT}`);
});
