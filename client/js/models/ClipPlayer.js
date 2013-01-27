WebRemixer.Models.ClipPlayer = Backbone.Model.extend({

  initialize: function(){
    _.bindAll(this);
    this.listenTo(this, 'change:playing', this.onPlayingChange);
  },
  
  getFreePlayer: function(){
    return (
      this.get('remix').get('playerManager')
          .get('videoPlayersByVideo')[this.get('clip').get('video').cid]
          .where({
            owner: null
          })[0]
    );
  },

  onPlayingChange: function(){
    if (this.get('playing')){
      this.play();
    }else{
      this.pause();
    }
  },
  
  play: function(){
    this.clearTimeouts();
  
    var videoPlayer = this.get('videoPlayer2') || this.getFreePlayer();
    
    var clip = this.get('clip');
    
    videoPlayer.set({
      owner: this,
      playTime: clip.get('cutStart') + (this.get('playTime') || 0),
      playing: true
    });
    
    if (this.get('loop')){
      var clipDuration = clip.get('duration');
      this.prepTimeout = setTimeout(this.prepareToLoop, (clipDuration - .5 ) * 1000);
      this.playTimeout = setTimeout(this.play, clipDuration * 1000);
    }
    
    this.set({
      playTime: undefined,
      videoPlayer: videoPlayer,
      videoPlayer2: undefined
    });
  },
  
  prepareToLoop: function(){
    var videoPlayer = this.getFreePlayer();
    
    videoPlayer.set({
      owner: this,
      playTime: this.get('clip').get('cutStart')
    });
    this.set('videoPlayer2', videoPlayer);
  },
  
  clearTimeouts: function(){
    if (this.prepTimeout){
      clearTimeout(this.prepTimeout);
      this.prepTimeout = undefined;
    }
    
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined;
    }
  },
  
  pause: function(){
    this.clearTimeouts();
  
    var videoPlayer = this.get('videoPlayer');
    if (videoPlayer){
      videoPlayer.set({
        owner: null,
        playTime: undefined,
        playing: false
      });
      
      this.set('videoPlayer', null);
    }
  }
});