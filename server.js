const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.config');
const watson = require('watson-developer-cloud');
const util = require('util');
const bodyParser = require('body-parser')
const fs = require('fs')

const config_watson = require('./config/config.js');

const app = express();
const compiler = webpack(config);

const username = config_watson.username;
const password = config_watson.password;
const classifier_id = config_watson.classifier_id;
const NUMBER_OF_MESSAGE_BEFORE_SENDING_TO_CLASSIFIER = 3;
var counter=0;
var classifierNameNumber=0;
var nextID="";

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

sendToWatson = () => {
  console.log("I send the new classifier.csv!")
};

app.post('/api/trainer', function(req, res, next) {
  var that = this;
  var arrayOfLines=req.body.arrayOfLines;
  var line = "";
  var numberOfLines = arrayOfLines.length;
  var indexLineAppended = 0;
  for (var i = 0; i < numberOfLines; i++) {
    line = arrayOfLines[i];
    fs.appendFile('./training/training_data.csv',line+"\n",function(err){
      if (err) {
        console.log("ERROR APPENDING FILE");
        res.status(500).send('Oups, problem when appending to the file');
      }
      //console.log("Success to append to file");
    })
  }
  counter++;
  console.log("Counter id: "+counter);
  var params = {
    language:'en',
    name: classifierNameNumber+'',
    training_data:fs.createReadStream('./training/training_data.csv')
  };
  classifierNameNumber++;
  if(counter == NUMBER_OF_MESSAGE_BEFORE_SENDING_TO_CLASSIFIER){
    nlClassifier.create(params,function(err,response){
      if (err) {
        console.log("Error: "+JSON.stringify(err));
      } else {
        nextID = response.classifier_id;
        console.log("nextID: "+nextID);
        counter = 0;
      }
    });
    counter=0;
  } else {
    res.send('Append was successful');
  }
});

app.post('/api/watson', function(req, res, next) {
  var arrayMessages = req.body.text;
  var length = arrayMessages.length;
  var jsonObj = {};
  var index = 0;
  var final_length = length;

  if(nextID!=""){
    var statusOfNext;
    nlClassifier.status({ classifier_id: nextID },
      function(err, response) {
        if (err) {
          console.log('error:', err);
        } else {
          console.log(JSON.stringify(response, null, 2));
          statusOfNext=response.status;
        }
      }
    );
  }

  if( statusOfNext === "Available" ) {
    currentID=nextID;
  }

  for (i = 0; i < length; i++) {
    var message = arrayMessages[i];
    if (message.length == 0) {
      final_length -= 1;
      console.log("MESSAGE EMPTY");
      continue;
    } else {
      console.log("MESSAGE: "+ message);
    }
    var params = {
      classifier: process.env.CLASSIFIER_ID || classifier_id, // pre-trained classifier
      text: arrayMessages[i]
    };
    nlClassifier.classify(params, function(err, results) {
      if (err) {
        return next(err);
      } else {
        jsonObj[index] = results;
        index += 1;
        if (index == final_length) {
          res.json(JSON.stringify(jsonObj));
        }
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
