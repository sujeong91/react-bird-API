const express = require('express');

const db = require('./models');

const app = express();
db.sequelize.sync(); // 테이블 생성

app.get('/', (req, res) => {
  res.send('hello, server');
});

app.listen(3065, () => {
  console.log('server is running localhost:3065');
});
