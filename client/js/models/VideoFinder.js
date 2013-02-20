WebRemixer.Models.VideoFinder = WebRemixer.Model.extend({
	initialize: function(){
		this.set('videos', new WebRemixer.Collections.Videos());
	}
});