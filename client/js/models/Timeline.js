WebRemixer.Models.Timeline = Backbone.Model.extend({

  initialize: function(){
    this.listenTo(this, 'change:remix', this.onRemixChange);
    
    this.set('timelineClips', new WebRemixer.Collections.TimelineClips());
    
    this.trigger('change:remix');
  },
  
  onRemixChange: function(){
    var remix = this.get('remix');
  
    if (remix){
      remix.get('timelines').add(this);
    }
    
    var prevRemix = this.previous('remix');
    
    if (prevRemix && prevRemix != remix){
      prevRemix.get('timelines').remove([this]);
    }
  }
});