const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 5 },
  }),
);
app.use(flash());

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const auth = require('./routes/auth');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('express-ejs-extend'));

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const authCheck = (req, res, next) => {
  if (req.session.uid === process.env.ADMIN_UID) {
    return next();
  }
  if (req.session.uid) {
    return res.redirect('/');
  }
  return res.redirect('/auth/signin');
};

app.use('/', index);
app.use('/dashboard', authCheck, dashboard);
app.use('/auth', auth);
// catch 404 and forward to error handler
app.use((req, res) => {
  createError(404);
  res.render('error', {
    title: '您所查看的頁面不存在 :(',
  });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
