WebRemixer.Models.PlayControls = WebRemixer.Model.extend({

	initialize: function(){
		this.listenTo(this.get('remix'), {
			'change:playing': this.onPlayingChange,
			'updatePlayTime': this.updatePlayTime
		});
	},

	updatePlayTime: function(){
		this.get('remix').set('playTime', ((new Date()).getTime() - this.playStartTime) / 1000);
	},
	
	onPlayingChange: function(remix, playing){
		if (playing){
			this.play();
		}else{
			this.pause();
		}
	},
	
	play: function(){
		var remix = this.get('remix');

		var playStartTime = this.playStartTime = (new Date()).getTime() - remix.get('playTime') * 1000;

		this.playInterval = setInterval(function(){
			remix.set('playTime', ((new Date()).getTime() - playStartTime) / 1000);
		}, 0);
	},
	
	pause: function(){
		if (this.playInterval){
			clearInterval(this.playInterval);
			this.playInterval = undefined;
		}
	}
});