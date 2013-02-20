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

		this.onVideoChange();
		this.onRemixChange();

		this.listenTo(this, {
			change: this.onChange,
			'change:remix': this.onRemixChange,
			'change:video': this.onVideoChange
		});
	},
	
	onChange: function(){
		this.save();
	},


	onRemixChange: function(){
	
		var prevRemix = this.previous('remix');
		if (prevRemix){
			prevRemix.get('clips').remove(this);
			this.stopListening(prevRemix);
		}
	
		var remix = this.get('remix');
		if (remix){
			var clips = remix.get('clips');

			clips.add(this);

			this.listenTo(remix, 'change:%s'.sprintf(remix.idAttribute), this.onChange);
		}
	},
	
	onVideoChange: function(){
		var video = this.get('video');
		
		var previousVideo = this.previous('video');
		if (previousVideo){
			this.stopListening(previousVideo);
		}
		
		if (video){
			this.listenTo(video, {
				 change: _.bind(this.trigger, this, 'change'),
				'change:title': this.onVideoTitleChange
			});
			
			video.trigger('change:title');
		}
	},
	
	onVideoTitleChange: function(){
		var title = this.get('title');
		if (!title || title == this.defaults.title){
			this.set('title', this.get('video').get('title'));
		}
	}
	
});