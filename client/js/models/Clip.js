WebRemixer.Models.Clip = Backbone.Model.extend({

  defaults: {
    video: null,
    cutStart: 0,
    cutDuration: 0
  },
  
  initialize: function(){
    // trigger a change event, everytime our video changes
    this.listenTo(this.get('video'), 'change', _.bind(this.trigger, this, "change")); 
  }
  
});