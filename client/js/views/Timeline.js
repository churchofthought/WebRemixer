WebRemixer.Views.Timeline = Backbone.View.extend({
  className: "timeline",
  
  initialize: function(){
    this.$el
      .attr({"data-num": this.model.get("num")})
      .droppable({
      
      });
      
    var self = this;
    
    var timelines = $.single(".remixer[data-id='%s'] > .timelines".sprintf(this.model.get("remixerId")));
    
    //insert timeline in the correct position
    timelines.children().each(function(){
      if ($(this).attr('data-num') > self.model.get('num')){
        self.$el.insertBefore(this);
        return false;
      }
    });
    
    //if not inserted, insert the timeline
    if (!this.$el.parent().length){
      timelines.append(this.el);
    }
  },
  
  render: function(){
    
  }
});