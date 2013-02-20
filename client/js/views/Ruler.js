WebRemixer.Views.Ruler = WebRemixer.View.extend({
	className: 'ruler',
	
	events: {
		click : 'onClick'
	},
	
	initialize: function() {
		this.$markings = $('<div/>').addClass('markings').appendTo(this.el);
		this.$timeHand = $('<div/>').addClass('timeHand').appendTo(this.el);
	
		var remix = this.model.get('remix');
		
		this.listenTo(remix, {
			'change:duration' : this.render,
			'change:playTime' : this.onPlayTimeChange
		});

		this.onPlayTimeChange(remix, remix.get('playTime'));

		this.render();
	},
	
	onClick: function(event){
		var remix = this.model.get('remix');
		
		var playing = remix.get('playing');
		var playTime = ((event.pageX - this.$el.offset().left) / WebRemixer.PX_PER_SEC);
		
		if (playing){
			remix.set('playing', false);
			remix.set({
				playTime: playTime,
				playing: true
			});
		}else{
			remix.set('playTime', playTime);
		}
	},
	
	onPlayTimeChange: function(model, val){
		var scrollMin = (WebRemixer.PX_PER_SEC * val + this.$el.prop('offsetLeft')) - (this.$window.width() / 2);

		if (this.$body && this.$body.scrollLeft() < scrollMin){
			this.$body.scrollLeft(scrollMin);
		}

		this.$timeHand.css('left', (WebRemixer.EMS_PER_SEC * val) + 'em');
	},
	
	render: function() {
		this.$markings.empty();
		for (var i = 0, duration = this.model.get('remix').get('duration'); i <= duration; ++i){
			this.$markings.append($('<div/>').text(i).append('<div/>'));
		}
	}
});