WebRemixer.View = Backbone.View.extend({
	constructor: function(){
		_.bindAll(this);

		Backbone.View.apply(this, arguments);

		this.$el
			.prop('id', this.model.cid)
			.data('view', this);
	}
});

// give every view access to common elements and window width / height
_.extend(WebRemixer.View.prototype, {
	$window: $(window),
	$html: $(document.documentElement)
});

WebRemixer.View.prototype.$window.resize(function(){
	WebRemixer.View.prototype.windowWidth = WebRemixer.View.prototype.$window.width();
	WebRemixer.View.prototype.windowHeight = WebRemixer.View.prototype.$window.height();
}).trigger('resize');

$(function(){
	WebRemixer.View.prototype.$body = $(document.body);
});