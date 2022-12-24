const Card = require('../models/card');

const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.getCard = (req, res, next) => {
  Card.find({})
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err.name === 'ResourceNotFound') {
        next(new NotFoundError('Карточки не найдены.'));
      }
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  console.log(req.body);
  console.log(req.user._id);
  Card.create({ name, link, owner: req.user._id })
    // { new: true }
    .then((card) => {
      if (!card) {
        throw new BadRequestError('Переданы некорректные данные.');
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err.name === 'ResourceNotFound') {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      } else {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  // console.log(req.params.cardId);
  // Card.findById(req.params.cardId)
  //   // { new: true }
  // .then((data) => {
  // if (data.owner.valueOf() === req.user._id) {
  // console.log(data.owner._id.valueOf());
  // console.log(req.user._id);
  Card.findByIdAndRemove(req.params.cardId, { new: true })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    // } else {
    // console.log(data.owner._id.valueOf());
    // console.log(req.user._id);
    //   next(new ForbiddenError('У вас нет прав для осуществления этого действия.'));
    // }
    // })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err.name === 'ResourceNotFound') {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      } else {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Карточка с указанным _id не найдена.');
    })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена.');
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Карточка с указанным _id не найдена.'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      next(new NotFoundError('Карточка с указанным _id не найдена.'));
    })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Карточка с указанным _id не найдена.'));
      } else {
        next(err);
      }
    });
};
