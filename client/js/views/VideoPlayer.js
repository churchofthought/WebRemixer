WebRemixer.Views.VideoPlayer = Backbone.View.extend({
  className: 'video-player',
    
  events: {
 
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    this.$video = $('<iframe/>').prop({
      id: Math.random().toString(36),
      src: 'http://www.youtube.com/embed/%s?origin=http://%s&enablejsapi=1&html5=1&autoplay=1&controls=1'.sprintf(this.model.get('video').get('sourceVideoId'),location.host)
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
               destroy : this.remove
    });
  },
  
  onPlayTimeChange: function(){
    var playTime = this.model.get('playTime');
    // check to make sure playTime is not undefined
    if (playTime >= 0){
      this.seek(playTime);
      this.model.set('playTime', undefined, {silent: true});
    }
  },
  
  onPlayingChange: function(){
    if (this.model.get('playing')){
      this.play();
    }else{
      this.pause();
    }
  },
  
  seek: function(t){
    this.player.seekTo(t, true);
  },
  
  play: function(t){
    this.player.playVideo();
  },
  
  pause: function(){
    this.player.pauseVideo();
  },
  
  setVolume: function(vol){
    this.player.setVolume(vol);
  },
  
  getVolume: function(){
    return this.player.getVolume();
  },

  onPlayerReady: function(){
    this.model.set('ready', true);
  },
  
  onPlayerStateChange: function(event){
    if (event.data != YT.PlayerState.PAUSED && !this.model.get('playing')){
      this.pause();
    }
  },

  render: function(){
    
  }
});