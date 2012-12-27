WebRemixer.Views.Timeline = Backbone.View.extend({
  className: 'timeline',

  initialize: function(){
    _.bindAll(this);
  
    this.$el
      .attr({'data-num': this.model.get('num')})
      .droppable({
        accept: '.video, .clip, .timeline-clip',
        drop: this.onDrop
      });
      
    var self = this;
    
    var timelines = $.single('.remix[data-id="%s"] > .timelines'.sprintf(this.model.get('remix').id));
    
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
  
  onDrop: function(event, ui){
    var view = ui.draggable.data("view");
    view.onDragStop();
    view.model.set("timeline", this.model);
  },
  
  render: function(){
    
  }
});