var config = require('../config/config.js');
var express = require('express');
var app = express.Router();
var methodOverride = require('method-override');

/* Handle DELETE/PUT data */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function(req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

/* GET locations listing */
app.get('/', function(req, res, next) {
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(err, client) {
    if (err) throw err;
    var dbo = client.db('gp_db');
    dbo.collection('locations').find().project({ _id: 0 }).toArray(function(err, result) {
      if (err) throw err;

      res.render('locations', { 
        title: 'Locations',
        result: result
      });
    });
    client.close();
  });
});

/* GET specific location */
app.get('/:id', function(req, res, next) {
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('locations').find({ id: req.params.id }).project({ _id: 0 }).toArray(function(error, result) {
      if (error) return next(error);

      if (result.length > 0) {
        res.render('location', { 
          title: 'Location details',
          found: true,
          result: result
        });
      } else {
        res.render('location', {
          title: `Location ${req.params.id} not found!`,
          found: false
        });
      }
    });
    client.close();
  });
});

/* POST new location */
app.post('/add', function(req, res, next) {
  if (!req.body.loc_id || !req.body.loc_name) return next(new Error('No data provided.'));
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('locations').insertOne({
      id: req.body.loc_id,
      name: req.body.loc_name
    }, function(error, location) {
      if (error) return next(error);
      if (!location) return next(new Error('Failed to add Location.'));
      res.redirect('/locations');
    });
    client.close();
  });
});

/* DELETE location */
app.delete('/:id', function(req, res, next) {
  if (!req.params.id) return next(new Error('No ID provided.'));
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('locations').remove({ id: req.params.id }, true, function(error, location) {
      if (error) return next(error);
      console.log('Deleted ' + req.params.id);
      res.redirect('/locations');
    });
    client.close();
  });
});

/* PUT location */
app.put('/:id', function(req, res, next) {
  if (!req.body.loc_id || !req.body.loc_name) return next(new Error('No data provided.'));
  if (!req.params.id) return next(new Error('No Location ID passed.'));
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('locations').update(
      { id: req.params.id }, 
      {
        id: req.body.loc_id,
        name: req.body.loc_name
      }, function(error, location) {
        if (error) return next(error);
        if (!location) return next(new Error('Failed to update Location.'));
        res.redirect('/locations');
      });
    client.close();
  });
});

module.exports = app;
