var express = require('express');
var app = express.Router();

/* GET locations listing. */
app.get('/', function(req, res, next) {
  res.send('All locations');
});

app.get('/:id', function(req, res, next) {
  res.send('Location ID: ' + req.params.id);
});

app.post('/add', function(req, res, next) {
  res.send('add');
});

app.delete('/del/:id', function(req, res, next) {
  res.send('del');
});

app.put('/mod/:id', function(req, res, next) {
  res.send('mod');
});

module.exports = app;
