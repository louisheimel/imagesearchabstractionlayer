var express = require('express');
var https = require('https');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient,
    api_url = 'https://api.imgur.com/3/gallery/search/?q=',
    clientid = '5cfe2aa5b1c8b48';

const makeDbConnectUrl = () => {
  const username = 'louis12'
  const password = 'superkey1'
  return 'mongodb://' + username + ':' + password + '@ds161099.mlab.com:61099/imagesearchabstraction'
}

const dbConnectUrl = makeDbConnectUrl();

function requestObjectMaker(querystr) {
  return {
    url: api_url + querystr,
    method: 'GET',
    headers: {
      'Authorization': 'Client-ID ' + clientid
    },
  }
}

function parseResponse(data) {
  return JSON.parse(data.body).data.filter(e => !e.is_album);
}

app.get('/', function(req, res) {
  res.send('hello');
});

app.get('/test', function(req, res) {
  request.get(requestObjectMaker('lolcats'), function(err, data, body) {
    res.json(parseResponse(data));
  });
});

app.get('/api/imagesearch/:query', function(req, res) {
  request.get(requestObjectMaker(req.params.query), (err, data, body) => {
    if (err) throw err;
  

   MongoClient.connect(dbConnectUrl, function(err, db) {
     if (err) throw err;
       db.createCollection('recentSearches');
       db.collection('recentSearches').save({ search: req.params.query});
       db.close();
     });
     var offset = parseInt(req.query.offset);
     request.get(requestObjectMaker(req.params.query.split('?')[0]), function(err, data, body) { 
    						    if (offset) {
          					      res.end(parseResponse(data).slice(0, offset));
          					    } else { 
          					      res.end(parseResponse(data))
          					    };
    						    })
  res.json(parseResponse(data))
  })
});

app.get('/recent', function(req, res) {
  MongoClient.connect(dbConnectUrl, function(err, db) {
    if (err) throw err;
    db.collection('recentSearches')
      .find({}, {'search':1, _id:0}, (err, data) => {
        data.toArray((err, data) => { res.end(JSON.stringify(data)); }) 
      });
    db.close();
  });
})

app.listen(process.env.PORT || 8080);
