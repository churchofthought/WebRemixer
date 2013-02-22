WebRemixer.Models.Clip = WebRemixer.Model.extend({

	urlRoot: 'clips',

	defaults: {
		cutStart: 0,
		cutDuration: 5,
		title: 'New Clip'
	},
	
	includeInJSON: {remix: WebRemixer.Models.Remix, title: String, video: WebRemixer.Models.Video, cutStart: Number, cutDuration: Number},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		this.listenTo(this, {
			change: this.onChange,
			'change:remix': this.onRemixChange,
			'change:video': this.onVideoChange
		});

		this.onRemixChange(this, this.get('remix'));
		this.onVideoChange(this, this.get('video'));
	},
	
	onChange: function(){
		this.save();
	},


	onRemixChange: function(clip, remix){
	
		var prevRemix = this.previous('remix');
		if (prevRemix){
			prevRemix.get('clips').remove(this);
			this.stopListening(prevRemix);
		}
	
		if (remix){
			var clips = remix.get('clips');

			clips.add(this);

			this.listenTo(remix, 'change:' + remix.idAttribute, this.onChange);
		}
	},
	
	onVideoChange: function(clip, video){
		var previousVideo = this.previous('video');
		if (previousVideo){
			this.stopListening(previousVideo);
		}
		
		if (video){
			this.listenTo(video, {
				change: _.partial(this.trigger, 'change'),
				'change:title': this.onVideoTitleChange
			});
			
			this.onVideoTitleChange(video, video.get('title'));
		}
	},
	
	onVideoTitleChange: function(video, videoTitle){
		var title = this.get('title');
		if (_.isEmpty(title) || title === this.defaults.title){
			this.set('title', videoTitle);
		}
	}
	
});