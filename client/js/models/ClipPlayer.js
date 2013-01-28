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
    this.pause();
  
    var videoPlayer = this.get('videoPlayer2') || this.getFreePlayer();
    
    var clip = this.get('clip');
    
    var clipDuration = clip.get('cutDuration');
    
    var playTime = (this.get('playTime') || 0) % clipDuration;
    
    videoPlayer.set({
      owner: this,
      playTime: clip.get('cutStart') + playTime,
      playing: true
    });
    
    if (this.get('loop')){
      var timeTillLoop = clipDuration - playTime;
      this.loopTime = new Date() * 1 + timeTillLoop * 1000;
      this.loopTimeout = setTimeout(this.prepareToLoop, (timeTillLoop - .5) * 1000);
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
    
    if (this.loopTimeout){
      clearTimeout(this.loopTimeout);
      this.loopTimeout = undefined;
    }
    this.loopTimeout = setTimeout(this.play, this.loopTime - new Date() * 1);
  },
  
  pause: function(){
    if (this.loopTimeout){
      clearTimeout(this.loopTimeout);
      this.loopTimeout = undefined;
    }
  
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