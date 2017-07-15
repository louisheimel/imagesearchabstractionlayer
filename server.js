var express = require('express');
var https = require('https');
var request = require('request');
var app = express();
var MongoClient = require('mongodb').MongoClient,
    api_url = 'https://api.imgur.com/3/gallery/search/?q=',
    clientid = '5cfe2aa5b1c8b48';
var AUTH_HEADERS = 
    {
      'Authorization': 'Client-ID ' + clientid
    }

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
    headers: AUTH_HEADERS,
  }
}

function parseResponse(data, offset) {
  const sliceData = (data, offset) => {
    return data.slice(offset, offset + 10)
  }

  const parsedData = sliceData(JSON.parse(data.body)
				   .data
			           .filter(e => !e.is_album), offset);
  return JSON.parse(data.body).data.filter(e => !e.is_album)
				   .map(e => {
				     return {
				       title: e.title,
				       altText: e.description,
				       imageUrl: e.link,
				       pageUrl: 'http://imgur.com/gallery/' + e.id
				     }
				   })
}

app.use(express.static('public'))

app.get('/', function(req, res) {
  res.send();
});

app.get('/test', function(req, res) {
  res.redirect('/api/imagesearch/lolcats')
});

app.get('/api/imagesearch/:query', function(req, res) {
  const query = req.params.query,
	offset = req.query.offset ? req.query.offset : 0

  request.get(requestObjectMaker(query), (err, data, body) => {
    if (err) throw err;
    MongoClient.connect(dbConnectUrl, (err, db) => {
      if (err) throw err;
      db.collection('recentSearches').save({search: query})
    })
    res.json(parseResponse(data))
  })
});

app.get('/recent', function(req, res) {
  MongoClient.connect(dbConnectUrl, function(err, db) {
    if (err) throw err;
    db.collection('recentSearches')
      .find({}, {'search':1, _id:0}, (err, data) => {
        data.toArray((err, data) => { res.json(data.slice(0, 10)); }) 
      });
    db.close();
  });
})

app.listen(process.env.PORT || 8080);
