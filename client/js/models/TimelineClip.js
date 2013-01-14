WebRemixer.Models.TimelineClip = Backbone.Model.extend({

  initialize: function(){
    if (!this.get('remix')){
      this.set('remix', this.get('timeline').get('remix'));
    }

    if (!this.get('duration')){
      this.set('duration', this.get('clip').get('cutDuration'));
    }
    
  
    this.listenTo(this, 'change:timeline', this.onTimelineChange);
    
    // trigger a change event, everytime our clip changes
    this.listenTo(this.get('clip'), 'change', _.bind(this.trigger, this, "change")); 
    
    //kickstart it
    this.trigger('change:timeline');
  },
  
  onTimelineChange: function(){
    var timeline = this.get('timeline');
    
    var prevTimeline = this.previous('timeline');
    
    if (prevTimeline && prevTimeline != timeline){
      prevTimeline.get('timelineClips').remove([this]);
    }
  
    timeline.get('timelineClips').add(this);
  }
  
});