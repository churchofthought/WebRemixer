WebRemixer.Collections.Clips = Backbone.Collection.extend({
	model: WebRemixer.Models.Clip,
	comparator: function(clip){
		return clip.get('order');
	}
});