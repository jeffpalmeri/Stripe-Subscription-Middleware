var express = require('express');
var router = express.Router();
const { 
  landingPage,
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
  getSecret,
  getSubscribe,
  postSubscribe
} = require('../controllers');
const { 
  asyncErrorHandler,
  isLoggedIn,
  isActiveSubscriber
} = require('../middlerware');

router.get('/', asyncErrorHandler(landingPage));
router.get('/register', getRegister);
router.post('/register', asyncErrorHandler(postRegister));
router.get('/login', getLogin);
router.post('/login', asyncErrorHandler(postLogin));
router.get('/logout', getLogout);
router.get('/secret', isLoggedIn, asyncErrorHandler(isActiveSubscriber), getSecret);
router.get('/subscribe', isLoggedIn, getSubscribe);
router.post('/subscribe', isLoggedIn, postSubscribe);

module.exports = router;
