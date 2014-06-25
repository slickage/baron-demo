var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var rateLimiter = require('rate-limiter');
var app = express();

var rules = [
  ['/invoice', 'post', 1, 60, true]
];

app.use(rateLimiter.expressMiddleware(rules));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/invoice', function(req, res) {
  var invoice = req.body;
  console.log(invoice);
  res.write(invoice.currency);
  res.end();
});



app.listen(3333);