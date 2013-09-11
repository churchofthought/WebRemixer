WebRemixer.Collections.TimelineClips = Backbone.Collection.extend({
	model: WebRemixer.Models.TimelineClip,
	comparator: function(timelineClip){
		return timelineClip.get('startTime');
	}
});