WebRemixer.Views.PlayControls = WebRemixer.View.extend({
	className: 'play-controls',
		
	events: {
		'click .play' : 'onPlayClick',
		'click .stop' : 'onStopClick',
		'click .restart' : 'onRestartClick'
	},
	


	initialize: function(){	
		this.$el.append(
		
			$('<button class="restart"/>').button({
				text: false,
				icons: {
					primary: 'ui-icon-seek-start'
				},
				label: 'Restart'
			}),
			
			this.$play = $('<button class="play"/>').button({
				text: false,
				icons: {
					primary: 'ui-icon-play'
				},
				label: 'Play'
			}),
		 
			$('<button class="stop"/>').button({
				text: false,
				icons: {
					primary: 'ui-icon-stop'
				},
				label: 'Stop'
			})

			
			
		);
		
		this.listenTo(this.model.get('remix'), 'change:playing', this.onPlayingChange);
	},
	
	onPlayingChange: function(){
	
		var playing = this.model.get('remix').get('playing');
	
		if (playing){
			this.$play.button('option', {
				icons: {
					primary: 'ui-icon-pause'
				},
				label: 'Pause'
			});
		}else{
			this.$play.button('option', {
				icons: {
					primary: 'ui-icon-play'
				},
				label: 'Play'
			});
		}
		
	},
	
	onPlayClick: function(){
		var remix = this.model.get('remix');
		remix.set('playing', !remix.get('playing'));
	},
	
	onStopClick: function(){
		this.model.get('remix').set({
			playing: false,
			playTime: 0
		});
	},
	
	onRestartClick: function(){
		var remix = this.model.get('remix');
		if (remix.get('playing')){
			remix.set({
				playing: false,
				playTime: 0
			}).set('playing', true);
		}else{
			remix.set('playTime', 0);
		}
		remix.trigger('change:playTime');
	}
	
});