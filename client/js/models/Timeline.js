WebRemixer.Models.Timeline = WebRemixer.Model.extend({

	urlRoot: 'timelines',
	
	includeInJSON: {remix: WebRemixer.Models.Remix, collapsed: Boolean, volume: Array, selectedAutomation: String},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		if (!this.get('volume')){
			this.set('volume', []);
		}

		this.set({
			automation: {},
			automationData: new WebRemixer.Models.AutomationData({timeline: this}),
			timelineClips : new WebRemixer.Collections.TimelineClips(),
			selection : {
				startTime: 0,
				duration: 0
			},
			automationEndPoint: [0,100]
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
			this.listenTo(remix, 'change:playTime', this.onRemixPlayTimeChange);
		}
	},


	onRemixPlayTimeChange: function(remix, playTime){
		var automation = this.get('automation');

		automation.volume = this.getAutomationValue(playTime, 'volume');
	},

	getAutomationValue: function(playTime, automationName){
		var points = this.get(automationName);

		var idx = _.sortedIndex(points, [playTime], '0');

		var firstPoint = points[idx - 1] || [0,100];
		var secondPoint = points[idx] || [this.get('remix').get('duration'), 100];

		var delta = (playTime - firstPoint[0]) / (secondPoint[0] - firstPoint[0]);

		return firstPoint[1] + delta * (secondPoint[1] - firstPoint[1]);
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