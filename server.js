var express = require('express');
var https = require('https');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient;

function requestObjectMaker(querystr) {
  const api_url = 'https://api.imgur.com/3/'
  return {
    url: api_url + querystr,
    method: 'GET',
    headers: {
      'Authorization': 'Client-ID 6c3bb20535ca5bd'
    },
  }
}

app.get('/', function(req, res) {
  res.send('hello');
});

app.get('/test', function(req, res) {
  request.get(requestObjectMaker('lolcats'), function(err, data, body) {
    res.end(body);
  });
});

app.get('/api/imagesearch/:query', function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/data", function(err, db) {
    if (err) throw err;
    db.createCollection('recentSearches');
    db.collection('recentSearches').save({ search: req.params.query});
    db.close();
  });
  var offset;
  var offset = parseInt(req.query.offset);
  request.get(requestObjectMaker(req.params.query.split('?')[0]), function(err, data, body) { 
 						    if (offset) {
						      res.end(JSON.stringify(JSON.parse(data.body).data.slice(0, offset)));
						    } else { 
                                                      res.end(JSON.stringify(JSON.parse(data.body).data)); 
						    };
 						    })
});

app.get('/recent', function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/data", function(err, db) {
    if (err) throw err;
    db.collection('recentSearches').find({}, {'search':1, _id:0}, function(err, data) { data.toArray(function(err, data) { res.end(JSON.stringify(data)); }) });
    db.close();
  });
})

app.listen(process.env.PORT || 8080);
