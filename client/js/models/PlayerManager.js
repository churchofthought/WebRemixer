WebRemixer.Models.PlayerManager = WebRemixer.Model.extend({

	defaults: {
		duration: 200
	},

	initialize: function(){
		this.allocatePlayers = _.debounce(this.allocatePlayers, 250);
	
		this.set({
			videoPlayersByVideo: {},
			timelineClipsByVideo: {}
		});
				
		this.listenTo(this.get('remix').get('timelines'), {
			add: this.onTimelinesAdd
		});
	},
	
	onTimelinesAdd: function(timeline){
		this.listenTo(timeline.get('timelineClips'), {
			add: this.onTimelineClipsAdd,
			remove: this.onTimelineClipsRemove
		});
	},
	
	allocatePlayers: function(){
		var timelineClipsByVideo = this.get('timelineClipsByVideo');
		for (var cid in timelineClipsByVideo){
			var timelineClips = timelineClipsByVideo[cid];
			
			var needed = 0;
			for (var i = timelineClips.length; i--; ){
				var curr = timelineClips.at(i);
				var intersections = 0;
				for (var z = timelineClips.length; z--; ){
					var other = timelineClips.at(z);
					if (WebRemixer.Util.intersects(curr, other)){
						intersections += (other.get('loop') && other.get('duration') > other.get('clip').get('cutDuration')) ? 2 : 1;
					}
				}
				needed = Math.max(needed, intersections);
			}
			
			this.allocatePlayersForVideo(timelineClips.video, needed);
		}
	},
	
	allocatePlayersForVideo: function(video, needed){
		var videoPlayersByVideo = this.get('videoPlayersByVideo');
	
		var videoPlayers = videoPlayersByVideo[video.cid];
		
		if (!videoPlayers){
			videoPlayers = videoPlayersByVideo[video.cid] = new WebRemixer.Collections.VideoPlayers();
		}
		
		if (videoPlayers.length < needed){
			do {
				var videoPlayer =
					new WebRemixer.Models.VideoPlayer({
						video: video
					});
				videoPlayers.add(videoPlayer);
				
				//instantiate view so flash/html5 videoPlayer gets appended to dom
				new WebRemixer.Views.VideoPlayer({
					el: $('<div/>').appendTo(document.body),
					model: videoPlayer
				});
			} while (videoPlayers.length < needed);
		}else if (videoPlayers.length > needed){
			do {
				videoPlayers.pop().destroy();
			} while (videoPlayers.length > needed);
		}
	},
	
	onTimelineClipsAdd: function(timelineClip){
		var video = timelineClip.get('clip').get('video');
		var timelineClipsByVideo = this.get('timelineClipsByVideo');
	
		var timelineClips = timelineClipsByVideo[video.cid];
		if (!timelineClips){
			timelineClips = timelineClipsByVideo[video.cid] = new WebRemixer.Collections.TimelineClips();
			timelineClips.video = video;
		}
		
		timelineClips.add(timelineClip);

		this.listenTo(timelineClip, 'change destroy', this.allocatePlayers);

		this.allocatePlayers();
	},
	
	onTimelineClipsRemove: function(timelineClip){
		this.stopListening(timelineClip);
	
		this.get('timelineClipsByVideo')[timelineClip.get('clip').get('video').cid].remove(timelineClip);
		
		this.allocatePlayers();
	}
	
});