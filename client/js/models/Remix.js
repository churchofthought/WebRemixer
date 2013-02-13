WebRemixer.Models.Remix = Backbone.Model.extend({
  urlRoot: 'remixes',
  
  includeInJSON: ['title'],

  defaults: {
    duration: 200,
    playTime: 0
  },
  
  shouldBeIdRefInJSON: true,

  initialize: function(){
  
    _.bindAll(this, 'playProcedure', 'onGotChildren');

    var opts = {
      remix: this
    };
    
    this.set({
            mainMenu: new WebRemixer.Models.MainMenu(opts),
        playControls: new WebRemixer.Models.PlayControls(opts),
               ruler: new WebRemixer.Models.Ruler(opts),
         clipManager: new WebRemixer.Models.ClipManager(opts),
       clipInspector: new WebRemixer.Models.ClipInspector(opts),
           timelines: new WebRemixer.Collections.Timelines(),
               clips: new WebRemixer.Collections.Clips()
    });
    
    this.set({
       playerManager: new WebRemixer.Models.PlayerManager(opts)
    });
    
    this.listenTo(this.get('clips'), {
      add: this.onClipsAdd,
      remove: this.onClipsRemove
    });
    
    this.listenTo(this.get('timelines'), {
      add: this.onTimelinesAdd,
      remove: this.onTimelinesRemove
    });
    
    this.listenTo(this, {
      change: this.onChange,
      'change:playing': this.onPlayingChange,
      'change:realTimeNeeded': this.onRealTimeNeededChange
    });
    
    this.listenTo(this.get('clips'), 'change', this.onClipsChange);
    this.listenTo(this.get('timelines'), 'change', this.onTimelinesChange);
    
    if (this.id) {
      this.fetchChildren();
    }else{
      this.save();
    }
  },
  
  fetchChildren: function(){
    if (!this.id) return;
    
    $.get('%s/children'.sprintf(this.url()), this.onGotChildren);
  },
  
  onGotChildren: function(res){
    console.log(res);
  },
  
  onChange: WebRemixer.Util.Model.saveChanged,
  
  /*
  onTimelinesChange: function(){
    this.save(undefined, {
      attrs: {
        clips: this.get('timelines').pluck(Backbone.Model.prototype.idAttribute)
      }
    }, {patch: true});
  },
  */
  
  onRealTimeNeededChange: function(){
    if (this.get('realTimeNeeded')){
      this.playProcedure();
      this.set('realTimeNeeded', false, {silent: true});
    }
  },
  
  onClipsAdd: function(model){
    model.set('remix', this);
  },
  
  onClipsRemove: function(model){
    model.set('remix', undefined);
  },
  
  onTimelinesAdd: function(model){
    model.set('remix', this);
  },
  
  onTimelinesRemove: function(model){
    model.set('remix', undefined);
  },
  
  onPlayingChange: function(){
    if (this.get('playing')){
      this.play();
    }else{
      this.pause();
    }
  },
  
  play: function(){
    this.playStartTime = new Date() * 1 - this.get('playTime') * 1000;
    this.playInterval = setInterval(this.playProcedure, 0);
  },
  
  playProcedure: function(){
    this.set('playTime', ((new Date() * 1) - this.playStartTime) / 1000);
  },
  
  pause: function(){
    if (this.playInterval){
      clearInterval(this.playInterval);
      this.playInterval = undefined;
    }
  }
  
});