WebRemixer.Models.ClipInspector = WebRemixer.Model.extend({

	initialize: function(){
		this.set('videoFinder', new WebRemixer.Models.VideoFinder({
		
		}));
	}
});