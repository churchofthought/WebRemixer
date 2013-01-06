WebRemixer.Views.VideoPlayer = Backbone.View.extend({
  className: 'video-player',
    
  events: {
 
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    this.$video = $('<iframe/>').attr({
      id: Math.random().toString(36),
      src: 'http://www.youtube.com/embed/%s?origin=http://%s&enablejsapi=1&html5=1&autoplay=1&controls=0'.sprintf(this.model.get('video').get('ytVideoId'),location.host)
    }).appendTo(this.el);
    
    this.player = new YT.Player(this.$video.attr('id'), {
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange
      }
    });
    
    this.render();
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
    
  },
  
  onPlayerStateChange: function(event){
    if (event.data != YT.PlayerState.PAUSED && !this.model.get('playing')){
      this.pause();
    }
  },

  render: function(){
    
  }
});