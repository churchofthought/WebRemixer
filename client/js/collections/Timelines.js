WebRemixer.Collections.Timelines = Backbone.Collection.extend({
	model: WebRemixer.Models.Timeline,
	comparator: function(timeline){
		return timeline.get('order');
	}
});