var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');

let configPath = path.join(process.cwd(), 'config', 'rainbow.develop.yaml');
let config = yaml.load(fs.readFileSync(configPath));

let indexRouter = require('./src/routes/index');
// var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());

let mongo = _.get(config, 'mongo');
let mongoIp = _.get(mongo, 'ip');
let mongoPort = _.get(mongo, 'port');
let mongoDatabase = _.get(mongo, 'database');

mongoose
  .connect(`mongodb://${mongoIp}:${mongoPort}/${mongoDatabase}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => {
    console.error(e);
    throw new Error('mongo DB connection fail');
  });

app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/', indexRouter);
// app.use('/users', usersRouter);

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