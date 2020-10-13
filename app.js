var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

// Redis configuration
const ioRedis = require('ioredis')
const host = 'localhost'
const port = 6379
const db = 0
const password = ''
/* Setup redis client and set key-space-notification event when key expired */
const redis = new ioRedis({host, port, db, password})
redis.on('ready', ()=> {
  console.log('Redis connected!');
  redis.config('SET', 'notify-keyspace-events', 'Ex')
})

const subscriber = new ioRedis({ host, port, db, password })

subscriber.subscribe("__keyevent@0__:expired")
subscriber.on('message',async (channel, message) => {
  // do somethings
  console.log(message);
})
//-------------------------//

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;