WebRemixer.Models.TimelineClip = Backbone.Model.extend({

  initialize: function(){
    _.bindAll(this);
  
    var clip = this.get('clip');

    if (!this.get('duration')){
      this.set('duration', clip.get('cutDuration'));
    }
    
    this.set('clipPlayer', 
      new WebRemixer.Models.ClipPlayer({
        clip: clip
      })
    );
    
  
    // trigger a change event, everytime our clip changes
    this.listenTo(clip, {
      change: _.bind(this.trigger, this, "change"),
      destroy: this.destroy
    });
    
    this.listenTo(this, {
      'change:timeline': this.onTimelineChange,
      'change:remix': this.onRemixChange
    });
  },
  
  onRemixChange: function(){
    var prevRemix = this.previous('remix');
    if (prevRemix){
      this.stopListening(prevRemix);
    }
    var remix = this.get('remix');
    if (remix){
      this.listenTo(remix, 'change:playing', this.onRemixPlayingChange);
    }
    this.get('clipPlayer').set('remix', remix);
  },
  
  onRemixPlayingChange: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }
  
    var remix = this.get('remix');
    
    var delay = this.get('startTime') - remix.get('playTime');
    
    if (remix.get('playing')){
      if (delay >= 0){
        this.playTimeout = setTimeout(this.prepareToPlay, Math.max(0, delay - WebRemixer.preloadDelay) * 1000);
      }else if (-delay <= this.get('duration')){
        this.play();
      }
    }else{
      this.pause();
    }
  },
  
  prepareToPlay: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }

    var remix = this.get('remix');
    
    remix.set('realTimeNeeded', true);
    
    var delay = this.get('startTime') - remix.get('playTime');
    
    this.get('clipPlayer').set({
      playTime: 0
    });
    
    this.playTimeout = setTimeout(this.play, delay * 1000);
  },
  
  play: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }
    
    var remix = this.get('remix');
    
    remix.set('realTimeNeeded', true);
    
    var passed = remix.get('playTime') - this.get('startTime');
    
    var pauseDelay = this.get('duration') - passed;
    
    if (pauseDelay >= 0){
      var loop = this.get('loop') && this.get('duration') > this.get('clip').get('cutDuration');
       
      this.get('clipPlayer').set({
        loop: loop,
        playTime: loop ? passed % this.get('clip').get('cutDuration') : passed,
        playing: true
      });
      this.playTimeout = setTimeout(this.pause, pauseDelay * 1000);
    }else{
      this.pause();
    }
  },
  
  pause: function(){
    if (this.playTimeout){
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined; 
    }
    this.get('clipPlayer').set('playing', false);
  },
  
  onTimelineChange: function(){
    var timeline = this.get('timeline');
    var remix = timeline ? timeline.get('remix') : null;
    this.set('remix', remix);
    this.get('clipPlayer').set('remix', remix);
  }
});