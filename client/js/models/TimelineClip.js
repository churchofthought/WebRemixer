WebRemixer.Models.TimelineClip = Backbone.Model.extend({

  defaults: {
    clip: null,
    timeline: null,
    remixer: null,
    startTime: 0,
  },
  
  initialize: function(){
    if (!this.get('remix')){
      this.set('remix', this.get('timeline').get('remix'));
    }
    
    
    
    if (!this.get('duration')){
      this.set('duration', this.get('clip').get('cutDuration'));
    }
    // trigger a change event, everytime our clip changes
    this.listenTo(this.get('clip'), 'change', _.bind(this.trigger, this, "change")); 
  }
  
});