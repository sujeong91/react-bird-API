const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const db = require('../models');

const router = express.Router();

router.get('/', (req, res) => { // user 정보 불러오기
  if (!req.user) {
    return res.status(401).send('로그인이 필요합니다.');
  }
  const user = Object.assign({}, req.user.toJSON());
  delete user.password;
  return res.json(user);
});

router.post('/', async (req, res) => { // 회원가입
  try {
    // 기존 유저 확인
    const exUser = await db.User.findOne({
      where: {
        userId: req.body.userId,
      },
    });
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.'); // send: 문자열을 보냄
    }
    // 비밀번호 암호화하여 유저 생성
    const hashedPassword = await bcrypt.hash(req.body.password, 12); // salt는 10~13 사이가 적정.
    const newUser = await db.User.create({
      nickname: req.body.nickname,
      userId: req.body.userId,
      password: hashedPassword,
    });
    return res.status(200).json(newUser); // json 데이터를 보냄
  } catch (e) {
    console.error(e);
    return res.status(400).send('e', e);
  }
});

router.post('/login', async (req, res, next) => { // 로그인
  // passport 불러온다?
  passport.authenticate('local', (err, user, info) => {
    // server error
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) {
          return next(loginErr);
        }
        const fullUser = await db.User.findOne({
          where: { id: user.id },
          include: [{
            model: db.Post,
            as: 'Posts',
            attributes: ['id'],
          }, {
            model: db.User,
            as: 'Followings',
            attributes: ['id'],
          }, {
            model: db.User,
            as: 'Followers',
            attributes: ['id'],
          }],
          attributes: ['id', 'nickname', 'userId'],
        });
        return res.json(fullUser);
      } catch (e) {
        next(e);
      }
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => { // 로그아웃
  req.logout();
  req.session.destroy();
  res.send('logout 성공');
});

module.exports = router;
