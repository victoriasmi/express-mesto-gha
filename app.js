const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const error = require('./middlewares/error');

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
      email: Joi.string().required().email({ tlds: { allow: false } }),
      password: Joi.string().required(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      // { tlds: { allow: false } }
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

// app.use((req, res) => {
//   res.status(401).send({ message: 'Необходима авторизация' });
// });

// app.use((req, res) => {
//   res.status(404).send({ message: 'Страница по указанному маршруту не найдена' });
// });

// авторизация
app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use(errors()); // обработчик ошибок celebrate
app.use(error);// централизованный обработчик ошибок

app.listen(PORT, () => {
  console.log(`app listening to port ${PORT}`);
});
