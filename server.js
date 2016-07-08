const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.config');
const watson = require('watson-developer-cloud');
const util = require('util');
const bodyParser = require('body-parser')

const config_watson = require('./config/config.js');

const app = express();
const compiler = webpack(config);

const username = config_watson.username;
const password = config_watson.password;
const classifier_id = config_watson.classifier_id;

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var nlClassifier = watson.natural_language_classifier({
  url : 'https://gateway.watsonplatform.net/natural-language-classifier/api',
  username : username,
  password : password,
  version  : 'v1'
});

app.post('/watson', function(req, res, next) {
  console.log("Req.data: "+req.body.text);
  var arrayMessages = req.body.text;
  var length = arrayMessages.length;
  var jsonon = {};
  var index = 0;

  for (i = 0; i < length; i++) {
    var message = arrayMessages[i];
    if (message.length == 0) {
      continue;
    }
    var params = {
      classifier: process.env.CLASSIFIER_ID || classifier_id, // pre-trained classifier
      text: arrayMessages[i]
    };
    nlClassifier.classify(params, function(err, results) {
      if (err)
        return next(err);
      else
        jsonon[index] = results;
        index += 1;
        if (index == length) {
          res.json(JSON.stringify(jsonon));
        }
    });
  }
});

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './www/index.html'));
});

app.listen(8080, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://0.0.0.0:8080');
});
