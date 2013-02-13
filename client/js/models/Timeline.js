WebRemixer.Models.Timeline = Backbone.Model.extend({

  urlRoot: 'timelines',
  
  shouldBeIdRefInJSON: true,
  
  includeInJSON: ['remix', 'order'],

  initialize: function(){
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
    
    this.listenTo(this, {
      change: this.onChange,
      'change:remix': this.onRemixChange
    });
    
    this.trigger('change:remix');
  },
  
  onChange: WebRemixer.Util.Model.saveChanged,
  
  onRemixChange: function(){
    if (this.collection){
      if (!this.get('order')){
        this.set('order', this.collection.indexOf(this) + 1);
      }
    }
  },
  
  onTimelineClipsAdd: function(model){
    model.set('timeline', this);
  },
  
  onTimelineClipsRemove: function(model){
    model.set('timeline', null);
  }
  
});