WebRemixer.Routers.Remix = Backbone.Router.extend({

	routes: {
			new : "newRemix",
		":id" : "getRemix"
	},

	newRemix: function() {
		
		var remix = new WebRemixer.Models.Remix();
		
		new WebRemixer.Views.Remix({
			model: remix
		}).$el.appendTo(document.body);

		remix.save();
		remix.once('change:' + remix.idAttribute, this.onNewRemixSaved);
	},

	onNewRemixSaved: function(model){
		for (var count = 6; count--;){
			new WebRemixer.Models.Timeline({remix: model}).save();
		}
	},

	getRemix: function(id) {
		var attrs = {};
		attrs[WebRemixer.Models.idAttribute] = id;

		var remix = new WebRemixer.Models.Remix(attrs);
		
		new WebRemixer.Views.Remix({
			model: remix
		}).$el.appendTo(document.body);
		
		remix.fetch();
	}

});