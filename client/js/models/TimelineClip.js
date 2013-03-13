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
			change: _.partial(this.trigger, 'change'),
			destroy: this.destroy
		});
		
		this.listenTo(this, {
			change: this.onChange,
			'change:timeline': this.onTimelineChange,
			'change:remix': this.onRemixChange
		});

		this.onTimelineChange(this, this.get('timeline'));
		this.onRemixChange(this, this.get('remix'));
	},

	onChange: function(){
		this.save();
	},
	
	onRemixChange: function(timelineClip, remix){
		var prevRemix = this.previous('remix');
		if (prevRemix){
			this.stopListening(prevRemix);
		}

		if (remix){
			this.listenTo(remix, 'change:playing', this.onRemixPlayingChange);
			this.listenTo(remix, 'change:' + remix.idAttribute, this.onChange);
		}
		this.get('clipPlayer').set('remix', remix);
	},


	onTimelineChange: function(timelineClip, timeline){
		var prevTimeline = this.previous('timeline');
		if (prevTimeline){
			prevTimeline.get('timelineClips').remove(this);
			this.stopListening(prevTimeline);
		}

		var remix;

		if (timeline){
			timeline.get('timelineClips').add(this);
			this.listenTo(timeline, 'change:' + WebRemixer.Models.Timeline.prototype.idAttribute, this.onChange);

			remix = timeline.get('remix');
		}

		this.set('remix', remix);
	},
	
	onRemixPlayingChange: function(remix, playing){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined;
		}
		
		var delay = this.get('startTime') - remix.get('playTime');
		
		if (playing){
			if (delay >= 0){
				this.playTimeout = setTimeout(this.prepareToPlay, Math.max(0, delay - WebRemixer.Config.preloadDelay) * 1000);
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
		
		remix.trigger('updatePlayTime');
		
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
		if (this.automateInterval){
			clearTimeout(this.automateInterval);
			this.automateInterval = undefined;
		}
		
		var remix = this.get('remix');
		
		remix.trigger('updatePlayTime');
		
		var passed = remix.get('playTime') - this.get('startTime');
		
		var pauseDelay = this.get('duration') - passed;
		
		if (pauseDelay >= 0){
			var loop = this.get('loop') && this.get('duration') > this.get('clip').get('cutDuration');
			 
			this.automate();
			this.automateInterval = setInterval(this.automate, 0);
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

	automate: function(){
		this.get('clipPlayer').set('volume', this.get('timeline').get('automation').volume);
	},
	
	pause: function(){
		if (this.playTimeout){
			clearTimeout(this.playTimeout);
			this.playTimeout = undefined;
		}
		if (this.automateInterval){
			clearInterval(this.automateInterval);
			this.automateInterval = undefined;
		}
		this.get('clipPlayer').set('playing', false);
	},

	intersects: function(lineClip){
		var start1 = this.get('startTime');
		var end1 = start1 + this.get('duration') + WebRemixer.Config.preloadDelay;
		
		var start2 = lineClip.get('startTime');
		var end2 = start2 + lineClip.get('duration');

		return (
			// if second clip starts within the first clip  
			(start2 > start1 && start2 < end1) ||

			// if second clip ends within the first clip
			(end2 > start1 && end2 < end1) ||

			// if second clip is large enough to contain the first clip
			(start2 <= start1 && end2 >= end1)
		);
	}

});