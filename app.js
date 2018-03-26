const express = require('express');
const app = express();

var path = require('path');
var createError = require('http-errors');

var mongodb = require('mongodb').MongoClient;

var index_router = require('./routes/index');
var loc_router = require('./routes/locations');
var emp_router = require('./routes/employees');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index_router);
app.use('/locations', loc_router);
app.use('/employees', emp_router);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));