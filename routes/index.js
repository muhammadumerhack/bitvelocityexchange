var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET home page. */
router.post('/api/v1/', function(req, res, next) {
  try {
    const {role} = req.body
  if(role == 'admin'){
    const {sellingPrice, quantity} = req.body
  }
  
  } catch (error) {
    
  }
});


module.exports = router;
