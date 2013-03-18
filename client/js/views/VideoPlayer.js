WebRemixer.Views.VideoPlayer = WebRemixer.View.extend({
	className: 'video-player',
	
	initialize: function(){

		WebRemixer.Util.$body.append(this.el);
		
		this.$video = $('<iframe/>').prop({
			id: Math.random().toString(36),
			src: 'http://www.youtube.com/embed/' + this.model.get('video').get('sourceVideoId') +
				'?origin=http://' + location.host + '&enablejsapi=1&html5=0&autoplay=1&controls=0'
		}).appendTo(this.el);
		
		this.player = new YT.Player(this.$video.prop('id'), {
			events: {
				onReady: this.onPlayerReady,
				onStateChange: this.onPlayerStateChange
			}
		});
		
		this.listenTo(this.model, {
			'change:playing' : this.onPlayingChange,
			'change:playTime': this.onPlayTimeChange,
			'change:volume': this.onVolumeChange,
			destroy : this.remove
		});
	},
	
	onPlayTimeChange: function(videoPlayer, playTime){
		// check to make sure playTime is not undefined
		if (playTime >= 0){
			this.player.seekTo(playTime, true);
			this.model.set('playTime', undefined, {silent: true});
		}
	},
	
	onPlayingChange: function(videoPlayer, playing){
		if (playing){
			this.player.playVideo();
		}else{
			this.player.pauseVideo();
		}
	},

	onVolumeChange: function(videoPlayer, vol){
		this.player.setVolume(vol);
	},

	onPlayerReady: function(){
		this.model.set('ready', true);
	},
	
	onPlayerStateChange: function(event){
		if (event.data != YT.PlayerState.PAUSED && !this.model.get('playing')){
			this.player.pauseVideo();
		}
	}
});