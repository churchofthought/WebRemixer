WebRemixer.Models.TimelineManager = WebRemixer.Model.extend({
	
	initialize: function(){
		this.listenTo(this.get('remix').get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
	},

	onTimelinesAdd: function(model){
		model.set('remix', this.get('remix'));
	},

	onTimelinesRemove: function(model){
		if (model.get('remix') === this.get('remix')){
			model.set('remix', undefined);
		}
	}
});