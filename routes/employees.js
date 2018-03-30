var config = require('../config/config.js');
var express = require('express');
var app = express.Router();
var methodOverride = require('method-override');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Handle DELETE/PUT data.
 * Catch '_method' value from Form and call indicated method.
 */
app.use(methodOverride(function(req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

/**
 * GET Employees listing.
 * Displays list of all Employees for 'address:port/employees' URL.
 */
app.get('/', function(req, res, next) {
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(err, client) {
    if (err) throw err;
    var dbo = client.db('gp_db');
    dbo.collection('employees').find().project({ _id: 0 }).toArray(function(err, result) {
      if (err) throw err;

      res.render('employees', { 
        title: 'Employees',
        result: result
      });
    });
    client.close();
  });
});

/**
 * GET specific Employee.
 * Displays details of given ID Employee.
 */
app.get('/:id', function(req, res, next) {
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('employees').find({ id: parseInt(req.params.id) }).project({ _id: 0 }).toArray(function(error, result) {
      if (error) return next(error);
      console.log(req.params.id);

      if (result.length > 0) {
        res.render('employee', { 
          title: 'Employee details',
          found: true,
          result: result
        });
      } else {
        res.render('employee', {
          title: `Employee not found!`,
          found: false
        });
      }
    });
    client.close();
  });
});

/**
 * POST new employee.
 * Create new DB entry in 'Employee' collection.
 */
app.post('/add', function(req, res, next) {
  if (!req.body.emp_name || !req.body.emp_salary) return next(new Error('No data provided.'));
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('employees').find().sort({id:-1}).limit(1).toArray(function(error, result) {
      if (error) return next(error);
      dbo.collection('employees').insertOne({
        id: parseInt(result[0].id + 1),
        name: req.body.emp_name,
        salary: req.body.emp_salary
      }, function(error, employee) {
        if (error) return next(error);
        if (!employee) return next(new Error('Failed to add Employee.'));
        res.redirect('/employees');
      });
      client.close();
    });
  });
});

/**
 * DELETE employee.
 * Delete given ID Employee entry from DB.
 */
app.delete('/:id', function(req, res, next) {
  if (!req.params.id) return next(new Error('No ID provided.'));
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('employees').remove({ id: parseInt(req.params.id) }, true, function(error, location) {
      if (error) return next(error);
      console.log('Deleted ' + req.params.id);
      res.redirect('/employees');
    });
    client.close();
  });
});

/**
 * PUT employee.
 * Update Employee details for given Employee ID.
 */
app.put('/:id', function(req, res, next) {
  if (!req.body.emp_name || !req.body.emp_salary) return next(new Error('No data provided.'));
  if (!req.params.id) return next(new Error('No Employee ID passed.'));
  var mongodb = require('mongodb').MongoClient;
  mongodb.connect(config.db_url + config.db_port, function(error, client) {
    if (error) return next(error);
    var dbo = client.db('gp_db');
    dbo.collection('employees').update(
      { id: parseInt(req.params.id) }, 
      {
        $set: {
          name: req.body.emp_name,
          salary: req.body.emp_salary
        }
      }, function(error, location) {
        if (error) return next(error);
        if (!location) return next(new Error('Failed to update Employee.'));
        res.redirect('/employees');
      });
    client.close();
  });
});

module.exports = app;