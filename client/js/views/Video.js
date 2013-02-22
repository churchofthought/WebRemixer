WebRemixer.Views.Video = WebRemixer.View.extend({
	className: 'video',
	
	initialize: function(){
		this.listenTo(this.model, 'change', this.render);
		
		this.render();
	},
	
	getFormattedDuration: function(){
		var duration = this.model.get('duration');
		return '%d:%02d'.sprintf(duration / 60, duration % 60);
	},
	
	render: function(){
		this.$el.css('background-image', 'url("' + this.model.get('thumbnail') + '")')
		.attr({
			'data-title': this.model.get('title'),
			'data-duration': this.getFormattedDuration()
		});
	}
});