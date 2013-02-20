WebRemixer.Models.ClipManager = WebRemixer.Model.extend({
	
	initialize: function(){
		this.listenTo(this.get('remix').get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});
	},

	onClipsAdd: function(model){
		model.set('remix', this.get('remix'));
	},
	
	onClipsRemove: function(model){
		if (model.get('remix') === this.get('remix')){
			model.set('remix', undefined);
		}
	}

});