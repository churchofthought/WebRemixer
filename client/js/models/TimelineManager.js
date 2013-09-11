WebRemixer.Models.TimelineManager = WebRemixer.Model.extend({
	
	initialize: function(){
		this.set('clipboard', []);

		var remix = this.get('remix');

		this.listenTo(remix.get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
		this.listenTo(remix, 'change:timelineIds', this.onTimelineIdsChange);
	},

	onTimelineIdsChange: function(remix, timelineIds){
		var timelines = remix.get('timelines');
		for (var i = timelineIds.length; i--;){
			var timeline = timelines.get(timelineIds[i]);
			if (timeline) timeline.set('order', i);
		}
	},

	onTimelinesAdd: function(timeline){
		timeline.set('remix', this.get('remix'));
	},

	onTimelinesRemove: function(timeline){
		if (timeline.get('remix') === this.get('remix')){
			timeline.set('remix', undefined);
		}
	}
});