var express = require('express');
var app = express();
var path = require('path');


app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname,'img/')));

app.get('/', function(req, res,next){
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, function(){
  console.log('listening on 3000');
});
