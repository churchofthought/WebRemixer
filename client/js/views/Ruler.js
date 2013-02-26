WebRemixer.Views.Ruler = WebRemixer.View.extend({
	className: 'ruler',
	
	events: {
		click : 'onClick'
	},
	
	initialize: function() {
		var remix = this.model.get('remix');

		this.$markings = $('<div/>').prop('className', 'markings').appendTo(this.el);
		this.$timeHand = $('<div/>').prop('className', 'timeHand').appendTo(this.options.$remix);
	
		
		
		this.listenTo(remix, {
			'change:duration' : this.render,
			'change:playTime' : this.onPlayTimeChange,
			'change:playing'  : this.onPlayingChange
		});

		this.render();

		this.onPlayTimeChange(remix, remix.get('playTime'));
	
		this.$window.scroll(this.onScroll);
	},

	onScroll: function(){
		this.$el.css('transform', 'translate3d(0,' + this.$window.scrollTop() + 'px,0)');
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
	
	onPlayTimeChange: function(remix, playTime){
		
		if (this.$body){
			this.$body.add(this.$html).stop(true, true).animate({
				scrollLeft: Math.max(0, WebRemixer.PX_PER_SEC * playTime + this.$el.prop('offsetLeft') - this.windowWidth / 2)
			});
		}

		this.$timeHand.css('transform', 'translate3d(' + (WebRemixer.EMS_PER_SEC * playTime) + 'em' + ',0,0)');
	},
	
	render: function() {
		this.$markings.empty();
		for (var i = 0, duration = this.model.get('remix').get('duration'); i <= duration; ++i){
			this.$markings.append($('<div/>').text(i).append('<div/>'));
		}
	}
});