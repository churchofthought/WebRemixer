WebRemixer.Models.Timeline = WebRemixer.Model.extend({

	urlRoot: 'timelines',
	
	includeInJSON: {remix: WebRemixer.Models.Remix},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		this.set({
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
		
		this.onRemixChange();

		this.listenTo(this, {
			change: this.onChange,
			'change:remix': this.onRemixChange
		});
	},
	
	onChange: function(){
		this.save();
	},
	
	onRemixChange: function(){
	
		var prevRemix = this.previous('remix');
		if (prevRemix){
			prevRemix.get('timelines').remove(this);
			this.stopListening(prevRemix);
		}
	
		var remix = this.get('remix');
		if (remix){
			var timelines = remix.get('timelines');

			timelines.add(this);
			
			this.listenTo(remix, 'change:%s'.sprintf(remix.idAttribute), this.onChange);
		}
	},
	
	onTimelineClipsAdd: function(model){
		model.set('timeline', this);
	},
	
	onTimelineClipsRemove: function(model){
		if (model.get('timeline') === this){
			model.set('timeline', undefined);
		}
	}
});