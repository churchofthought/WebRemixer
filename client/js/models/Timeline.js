WebRemixer.Models.Timeline = Backbone.Model.extend({

  urlRoot: 'timelines',
  
  includeInJSON: {remix: WebRemixer.Models.Remix, order: String},

  initialize: function(){
    _.bindAll(this);

    this.set({
      timelineClips : new WebRemixer.Collections.TimelineClips(),
      selection : {
        startTime: 0,
        duration: 0
      }
    });
     
    this.listenTo(this.get('timelineClips'), {
      add: this.onTimelineClipsAdd,
      remove: this.onTimelineClipsRemove
    });
    
    this.onRemixChange();

    this.listenTo(this, {
      change: this.onChange,
      'change:remix': this.onRemixChange
    });
  },
  
  onChange: function(){
    this.save();
  },
  
  onRemixChange: function(){
  
    var prevRemix = this.previous('remix');
    if (prevRemix){
      prevRemix.get('timelines').remove(this);
      this.stopListening(prevRemix);
    }
  
    var remix = this.get('remix');
    if (remix){
      var timelines = remix.get('timelines');

      timelines.add(this);
      if (!this.get('order')){
        this.set('order', timelines.indexOf(this) + 1);
      }
      this.listenTo(remix, 'change:%s'.sprintf(WebRemixer.Models.Remix.prototype.idAttribute), this.onChange);
    }
  },
  
  onTimelineClipsAdd: function(model){
    model.set('timeline', this);
  },
  
  onTimelineClipsRemove: function(model){
    if (model.get('timeline') === this){
      model.set('timeline', undefined);
    }
  }
});