WebRemixer.Models.Timeline = Backbone.Model.extend({

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
  },
  
  onTimelineClipsAdd: function(model){
    model.set('timeline', this);
  },
  
  onTimelineClipsRemove: function(model){
    model.set('timeline', null);
  }
  
});