WebRemixer.Models.PlayControls = WebRemixer.Model.extend({

	initialize: function(){
		this.listenTo(this.get('remix'), {
			'change:playing': this.onPlayingChange,
			'change:realTimeNeeded': this.onRealTimeNeededChange
		});
	},

	onRealTimeNeededChange: function(){
		var remix = this.get('remix');

		if (remix.get('realTimeNeeded')){
			this.playProcedure();
			remix.set('realTimeNeeded', false, {silent: true});
		}
	},
	
	onPlayingChange: function(){
		if (this.get('remix').get('playing')){
			this.play();
		}else{
			this.pause();
		}
	},
	
	play: function(){
		this.playStartTime = new Date() * 1 - this.get('remix').get('playTime') * 1000;
		this.playInterval = setInterval(this.playProcedure, 0);
	},
	
	playProcedure: function(){
		this.get('remix').set('playTime', ((new Date() * 1) - this.playStartTime) / 1000);
	},
	
	pause: function(){
		if (this.playInterval){
			clearInterval(this.playInterval);
			this.playInterval = undefined;
		}
	}
});