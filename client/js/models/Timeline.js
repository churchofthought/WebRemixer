WebRemixer.Models.Timeline = WebRemixer.Model.extend({

	urlRoot: 'timelines',
	
	includeInJSON: {remix: WebRemixer.Models.Remix, collapsed: Boolean, volumeAutomation: Array, selectedAutomation: String},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		if (!this.get('volumeAutomation')){
			this.set('volumeAutomation', []);
		}

		this.set({
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
			'change:selectedAutomation': this.onSelectedAutomationChange,
			'change:remix': this.onRemixChange
		});

		this.onSelectedAutomationChange(this, this.get('selectedAutomation'));
		this.onRemixChange(this, this.get('remix'));
	},

	onSelectedAutomationChange: function(timeline, selectedAutomation){
		this.set('selectedAutomationPoints', this.get(selectedAutomation + 'Automation'));
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
			this.listenTo(remix, 'change:duration', this.onRemixDurationChange);

			this.onRemixDurationChange(remix, remix.get('duration'));
		}
	},

	onRemixDurationChange: function(remix, duration){
		this.get('automationEndPoint')[0] = duration;
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