const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

const passportConfig = require('./passport');
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

dotenv.config();
const app = express();
db.sequelize.sync(); // 테이블 생성
passportConfig();

app.use(morgan('dev')); // 로그 남김
app.use(cors({
  origin: true,
  credentials: true,
})); // cors error해결
// ------ req.body 쓸 수 있게 해줌.
app.use(express.json()); // 제이슨 형식의 데이터 처리
app.use(express.urlencoded({ extended: true })); // 폼 데이터 처리
// ------
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
  resave: false, // 매번 세션 강제 저장. 필수값.
  saveUninitialized: false, // 빈 값도 저장. 필수값.
  secret: process.env.COOKIE_SECRET, // 쿠키파서와 같은 값을 쓴다. 암호화.
  cookie: {
    httpOnly: true, // javascript로 쿠키 접근 못하게 함.
    secure: false, // https를 쓸 때 true
  },
  name: 'rnbck',
}));
app.use(passport.initialize());
app.use(passport.session()); // expressSession의 의존관계기 떄문에 꼭 그 다음에 써주어야 함.

// API 연결
app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(3065, () => {
  console.log('server is running localhost:3065');
});
