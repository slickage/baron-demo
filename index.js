var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var rateLimiter = require('rate-limiter');
var request = require('request');
var app = express();

// Config settings
var baronInvoiceRoute = 'http://localhost:3000/invoices';
var baronApiKey = 'youshouldreallychangethis';
var port = 3333;

// Rate Limiting config (5 request every 60 seconds)
var rules = [
  ['/invoice', 'post', 5, 60, true]
];

// Middleware
app.use(rateLimiter.expressMiddleware(rules));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Submitting the invoice form posts to here so we can add in the api_key
// and rate limit user's ability to create invoices within baron.
app.post('/invoice', function(req, res) {
  var invoice = req.body;
  invoice.api_key = baronApiKey;
  request.post({ url: baronInvoiceRoute, form: invoice }, function(err, baronRes, body) {
    if (!err && baronRes && baronRes.statusCode && baronRes.statusCode === 200) {
      var invoiceId = JSON.parse(body).id;
      var data = {};
      data.invoiceUrl = baronInvoiceRoute + '/' + invoiceId;
      data.invoiceId = invoiceId;
      res.status(200).send(data);
      res.end();
    }
    else if(err && !baronRes) {
      res.status(500).write(err.message);
      res.end();
    }
    else {
      res.status(baronRes.statusCode).send(body ? body : new Error('Unknown error, please check back later.'));
      res.end();
    }
  });
});

app.listen(port);