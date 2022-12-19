const supertest = require('supertest');
const app = require('./app');

const request = supertest(app);
// Теперь мы можем обращаться к методам библиотеки через объект request.
// Все методы этого объекта возвращают промисы, которые нужно обработать асинхронно.
