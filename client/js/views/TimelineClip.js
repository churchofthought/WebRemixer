WebRemixer.Views.TimelineClip = Backbone.View.extend({
  className: "timeline-clip",
  
  initialize: function(){
    $.single(".remix[data-id='%s'] > .timelines > .timeline[data-num='%s']"
      .sprintf(this.model.get("remix").id, this.model.get("timeline").get("num")))
      .append(this.el);
  },
  
  render: function(){
    
  }
});