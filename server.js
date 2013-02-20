var    async = require('async'),
		mongoose = require('mongoose'),
		 express = require('express'),
			stylus = require('stylus'),
				 nib = require('nib');

var Schemas = {};

Schemas.Clip = mongoose.Schema({
				remix: {ref: 'Remix', type: mongoose.Schema.Types.ObjectId},
				title: String,
		 cutStart: Number,
	cutDuration: Number,
				video: {
					source: String,
					sourceVideoId: String
				}
});

Schemas.TimelineClip    = mongoose.Schema({
	remix:      {ref: 'Remix', type: mongoose.Schema.Types.ObjectId},
	timeline:   {ref: 'Timeline', type: mongoose.Schema.Types.ObjectId},
	clip:       {ref: 'Clip', type: mongoose.Schema.Types.ObjectId},
	title:      String,
	startTime:  Number,
	duration:   Number,
	loop:       Boolean
});

Schemas.Timeline = mongoose.Schema({
	remix: {ref: 'Remix', type: mongoose.Schema.Types.ObjectId}
});

Schemas.Remix = mongoose.Schema({
	title: String,
	clipIds: [{ref: 'Clip', type: mongoose.Schema.Types.ObjectId}],
	timelineIds: [{ref: 'Timeline', type: mongoose.Schema.Types.ObjectId}]
});



var Models = {
	Remix         : mongoose.model('Remix',         Schemas.Remix),
	Timeline      : mongoose.model('Timeline',      Schemas.Timeline),
	Clip          : mongoose.model('Clip',          Schemas.Clip),
	TimelineClip  : mongoose.model('TimelineClip',  Schemas.TimelineClip)
};




mongoose.connect('mongodb://localhost/web-remixer');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	
});













 
var app = express();
 
app.use(express.bodyParser());

app.use(express.static('public'));

app.use(stylus.middleware({
	serve: true,
	src: 'client/css',
	dest: 'public',
	compile: function(str, path) {
		return stylus(str)
		.set('filename', path)
		.set('compress', true)
		.use(nib());
	}
}));


function addCRUDMethods(url, model){
		app.post(url, function (req, res){
			var m = new model(req.body);
			m.save();
			return res.send(m);
		});
		
		app.put(url + '/:id', function (req, res){
			model.findByIdAndUpdate(req.params.id, req.body, function (err, m) {
				res.send(m);
			});
		});
		
		app.get(url + '/:id', function (req, res){
			return model.findById(req.params.id, function (err, m) {
				return res.send(m);
			});
		});

		app.delete(url + '/:id', function (req, res){
			model.findByIdAndRemove(req.params.id, function (err, m) {
				res.send(m);
			});
		});
}

app.get('/remixes/:id/children', function (req, res){

	var query = {
		remix: req.params.id
	};
	
	async.parallel({
		timelines: function (callback){
			Models.Timeline.find(query, callback);
		},
		timelineClips: function (callback){
			Models.TimelineClip.find(query, callback);
		},
		clips: function(callback){
			Models.Clip.find(query, callback);
		}
	},
	
	function (err, results){
		res.send(results);
	});


});


addCRUDMethods('/remixes',       Models.Remix);
addCRUDMethods('/timelines',     Models.Timeline);
addCRUDMethods('/timeline-clips', Models.TimelineClip);
addCRUDMethods('/clips',         Models.Clip);



app.get('/new', function (req, res){
	res.sendfile('public/main.html');
});

app.get('/:id', function (req, res){
	res.sendfile('public/main.html');
});


app.listen(3000);
