WebRemixer.Models.Remix = Backbone.Model.extend({

  defaults: {
    duration: 200
  },

  initialize: function(){
  
    window.mix = this;
  
    var opts = {
      remix: this
    };
    
    this.set({
        playControls: new WebRemixer.Models.PlayControls(opts),
               ruler: new WebRemixer.Models.Ruler(opts),
         clipManager: new WebRemixer.Models.ClipManager(opts),
       clipInspector: new WebRemixer.Models.ClipInspector(opts),
           timelines: new WebRemixer.Collections.Timelines(),
               clips: new WebRemixer.Collections.Clips(),
 videoPlayersByVideo: {},
timelineClipsByVideo: {},
    });
    
    this.listenTo(this.get('timelines'), {
      add: this.onTimelinesAdd
    });
  },
  
  onTimelinesAdd: function(model){
    this.listenTo(model.get('timelineClips'), {
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
            intersections += other.get('loop') ? 2 : 1;
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
    
    while (videoPlayers.length < needed){
      videoPlayers.add(
        new WebRemixer.Models.VideoPlayer({
          video: video
        })
      );
    }
  },
  
  onTimelineClipsAdd: function(model){
    var video = model.get('clip').get('video');
    var timelineClipsByVideo = this.get('timelineClipsByVideo');
  
    var timelineClips = timelineClipsByVideo[video.cid];
    if (!timelineClips){
      timelineClips = timelineClipsByVideo[video.cid] = new WebRemixer.Collections.TimelineClips();
      timelineClips.video = video;
    }
    
    timelineClips.add(model);
    
    this.allocatePlayers();
  },
  
  onTimelineClipsRemove: function(model){
    this.get('timelineClipsByVideo')[model.get('clip').get('video').cid].remove(model);
    
    this.allocatePlayers();
  }
});