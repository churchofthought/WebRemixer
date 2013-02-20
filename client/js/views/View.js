WebRemixer.View = Backbone.View.extend({
	constructor: function(){
		_.bindAll(this);

		Backbone.View.apply(this, arguments);

		this.$el
			.prop('id', this.model.cid)
			.data('view', this);
	}
});

// give every view access to the window and body
WebRemixer.View.prototype.$window = $(window);

$(function(){
	WebRemixer.View.prototype.$body = $(document.body);
});