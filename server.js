var express = require('express');
var https = require('https');
var request = require('request');
var app = express();

var options = {
  url: 'https://api.imgur.com/3/gallery/search?q=lolcats',
  method: 'GET',
  headers: {
    'Authorization': 'Client-ID 6c3bb20535ca5bd'
  },
};

app.get('/', function(req, res) {
  res.send('hello');
});

app.get('/test', function(req, res) {
  request.get(options, function(err, data, body) {
    res.end(body);
  });
});

app.get('/api/imagesearch/:query', function(req, res) {
  res.end(req.params.query);
});

app.listen(8080);
