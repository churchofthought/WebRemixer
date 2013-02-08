var mongoose = require('mongoose');
     express = require('express'),
      stylus = require('stylus'),
         nib = require('nib');

var Schemas = {};

Schemas.Remix = mongoose.Schema({
  name: String
});

var Models = {};

Models.Remix = mongoose.model('Remix', Schemas.Remix);




mongoose.connect('mongodb://localhost/web-remixer');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  
});













 
var app = express();
 
 
app.configure(function(){
  app.use(stylus.middleware({
    debug: true,
    src: 'client/css',
    dest: 'public',
    compile: function(str, path) {
      return stylus(str)
      .set('filename', path)
      .set('warn', true)
      //.set('compress', true)
      .use(nib());
    }
  }));
  app.use(express.static('public'));
});




// create
app.post('/remixes', function (req, res){
  var remix = new Models.Remix(req.body);
  remix.save();
  return res.send(remix);
});

// update
app.put('/remixes', function (req, res){
  Models.Remix.findByIdAndUpdate(res.params.id, {$set: res.params}, function (err, remix) {
    res.send(remix);
  });
});

// get existing
app.get('/remixes/:id', function (req, res){
  return Models.Remix.findById(req.params.id, function (err, remix) {
    return res.send(remix);
  });
});

app.get('/new', function (req, res){
  res.sendfile('public/main.html');
});



app.listen(3000);
