WebRemixer.Models.ClipManager = WebRemixer.Model.extend({
	
	initialize: function(){
		var remix = this.get('remix');

		this.listenTo(remix.get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});

		this.listenTo(remix, 'change:clipIds', this.onClipIdsChange);
	},

	onClipIdsChange: function(remix, clipIds){
		var clips = remix.get('clips');

		for (var i = clipIds.length; i--;){
			var clip = clips.get(clipIds[i]);
			if (clip) clip.set('order', i);
		}
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