WebRemixer.Models.TimelineClip = Backbone.Model.extend({

  defaults: {
    clip: null,
    timeline: null,
    remixer: null,
    startTime: 0,
    duration: 0
  },
  
  initialize: function(){
    // trigger a change event, everytime our clip changes
    this.listenTo(this.get('clip'), 'change', _.bind(this.trigger, this, "change")); 
  }
  
});