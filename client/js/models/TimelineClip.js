WebRemixer.Models.TimelineClip = WebRemixer.Model.extend({

	urlRoot: 'timeline-clips',
	
	includeInJSON: {remix: WebRemixer.Models.Remix, timeline: WebRemixer.Models.Timeline, clip: WebRemixer.Models.Clip, startTime: Number, duration: Number, loop: Boolean},
		
	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);
	
		var clip = this.get('clip');

		if (!this.get('duration')){
			this.set('duration', clip.get('cutDuration'));
		}
		
		this.set('clipPlayer', 
			new WebRemixer.Models.ClipPlayer({
				clip: clip
			})
		);
		
	
		// trigger a change event, everytime our clip changes
		this.listenTo(clip, {
			change: _.bind(this.trigger, this, "change"),
			destroy: this.destroy
		});

		this.onTimelineChange();
		this.onRemixChange();
		
		this.listenTo(this, {
			change: this.onChange,
			'change:timeline': this.onTimelineChange,
			'change:remix': this.onRemixChange
		});
	},

	onChange: function(){
		this.save();
	},
	
	onRemixChange: function(){
		var prevRemix = this.previous('remix');
		if (prevRemix){
			this.stopListening(prevRemix);
		}
		var remix = this.get('remix');
		if (remix){
			this.listenTo(remix, 'change:playing', this.onRemixPlayingChange);
			this.listenTo(remix, 'change:' + remix.idAttribute, this.onChange);
		}
		this.get('clipPlayer').set('remix', remix);
	},


	onTimelineChange: function(){
		var prevTimeline = this.previous('timeline');
		if (prevTimeline){
			prevTimeline.get('timelineClips').remove(this);
			this.stopListening(prevTimeline);
		}

		var timeline = this.get('timeline');

		var remix;

		if (timeline){
			timeline.get('timelineClips').add(this);
			this.listenTo(timeline, 'change:' + WebRemixer.Models.Timeline.prototype.idAttribute, this.onChange);

			remix = timeline.get('remix');
		}

		this.set('remix', remix);
	},
	
	onRemixPlayingChange: function(){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined;
		}
	
		var remix = this.get('remix');
		
		var delay = this.get('startTime') - remix.get('playTime');
		
		if (remix.get('playing')){
			if (delay >= 0){
				this.playTimeout = setTimeout(this.prepareToPlay, Math.max(0, delay - WebRemixer.preloadDelay) * 1000);
			}else if (-delay <= this.get('duration')){
				this.play();
			}
		}else{
			this.pause();
		}
	},
	
	prepareToPlay: function(){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined; 
		}

		var remix = this.get('remix');
		
		remix.set('realTimeNeeded', true);
		
		var delay = this.get('startTime') - remix.get('playTime');
		
		this.get('clipPlayer').set({
			playTime: 0
		});
		
		this.playTimeout = setTimeout(this.play, delay * 1000);
	},
	
	play: function(){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined; 
		}
		
		var remix = this.get('remix');
		
		remix.set('realTimeNeeded', true);
		
		var passed = remix.get('playTime') - this.get('startTime');
		
		var pauseDelay = this.get('duration') - passed;
		
		if (pauseDelay >= 0){
			var loop = this.get('loop') && this.get('duration') > this.get('clip').get('cutDuration');
			 
			this.get('clipPlayer').set({
				loop: loop,
				playTime: loop ? passed % this.get('clip').get('cutDuration') : passed,
				playing: true
			});
			this.playTimeout = setTimeout(this.pause, pauseDelay * 1000);
		}else{
			this.pause();
		}
	},
	
	pause: function(){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined; 
		}
		this.get('clipPlayer').set('playing', false);
	}
});