WebRemixer.Models.ClipManager = WebRemixer.Model.extend({
	
	initialize: function(){
		this.listenTo(this.get('remix').get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});
	},

	onClipsAdd: function(clip){
		clip.set('remix', this.get('remix'));
	},
	
	onClipsRemove: function(clip){
		if (clip.get('remix') === this.get('remix')){
			clip.set('remix', undefined);
		}
	}

});