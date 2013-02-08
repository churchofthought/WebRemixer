WebRemixer.Models.Remix = Backbone.RelationalModel.extend({
  urlRoot: '/remixes',
  
  relations: [{
    type: Backbone.HasMany,
    key: 'clips',
    relatedModel: WebRemixer.Models.Clip,
    collectionType: WebRemixer.Collections.Clips,
    reverseRelation: {
      key: 'remix',
      includeInJSON: 'id'
    }
  }],

  defaults: {
    duration: 200,
    playTime: 0
  },
  
  toJSON: function() {
    return _.pick(this.attributes, "id", "name" );
  },

  initialize: function(){
  
    _.bindAll(this);
  
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
      'change:playing': this.onPlayingChange,
      'change:realTimeNeeded': this.onRealTimeNeededChange
    });
  },
  
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