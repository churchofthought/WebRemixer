WebRemixer.View = Backbone.View.extend({
	constructor: function(){
		_.bindAll(this);

		Backbone.View.apply(this, arguments);

		this.$el
			.prop('id', this.model.cid)
			.data('view', this);
	}
});

HTMLDocument.prototype.createSVGElement = _.partial(HTMLDocument.prototype.createElementNS, 'http://www.w3.org/2000/svg');