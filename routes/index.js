var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Home Page', 
    content: 'Click link below to display Locations or Employees list.',
    links: [
      { name: 'Locations >', link: '/locations' },
      { name: 'Employees >', link: '/employees' }
    ]
  });
});

module.exports = router;
