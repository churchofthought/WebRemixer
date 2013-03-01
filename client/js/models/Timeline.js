WebRemixer.Models.Timeline = WebRemixer.Model.extend({

	urlRoot: 'timelines',
	
	includeInJSON: {remix: WebRemixer.Models.Remix},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		this.set({
			automationData: new WebRemixer.Models.AutomationData({timeline: this}),
			timelineClips : new WebRemixer.Collections.TimelineClips(),
			selection : {
				startTime: 0,
				duration: 0
			}
		});
		 
		this.listenTo(this.get('timelineClips'), {
			add: this.onTimelineClipsAdd,
			remove: this.onTimelineClipsRemove
		});

		this.listenTo(this, {
			change: this.onChange,
			'change:remix': this.onRemixChange
		});

		this.onRemixChange(this, this.get('remix'));
	},
	
	onChange: function(){
		this.save();
	},
	
	onRemixChange: function(timeline, remix){
	
		var prevRemix = this.previous('remix');
		if (prevRemix){
			prevRemix.get('timelines').remove(this);
			this.stopListening(prevRemix);
		}
	
		if (remix){
			var timelines = remix.get('timelines');

			timelines.add(this);
			
			this.listenTo(remix, 'change' + remix.idAttribute, this.onChange);
		}
	},
	
	onTimelineClipsAdd: function(timelineClip){
		timelineClip.set('timeline', this);
	},
	
	onTimelineClipsRemove: function(timelineClip){
		if (timelineClip.get('timeline') === this){
			timelineClip.set('timeline', undefined);
		}
	}
});