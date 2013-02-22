WebRemixer.Models.TimelineManager = WebRemixer.Model.extend({
	
	initialize: function(){
		this.listenTo(this.get('remix').get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
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