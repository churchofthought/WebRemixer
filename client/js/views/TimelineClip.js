WebRemixer.Views.TimelineClip = Backbone.View.extend({
  className: 'timeline-clip',
  
  initialize: function(){
    _.bindAll(this);
  
  
    var grid = [parseFloat($(document.body).css('fontSize')), 1];
    
    this.$el.data("view", this).draggable({
      containment: '.timelines',
      stack: '.' + this.className,
      snap: '.timeline',
      grid: grid,
      stop: this.onDragStop,
    }).resizable({
      containment: 'parent',
      handles: 'e,w',
      grid: grid,
      stop: this.onResizeStop
    });
    
    this.listenTo(this.model, 'change', this.render);
    
    this.render();
  },
  
  onDragStop: function(){
    this.model.set("startTime", this.$el.position().left / WebRemixer.PX_PER_SEC);
  },
  
  onResizeStop: function(){
    this.model.set("duration", this.$el.width() / WebRemixer.PX_PER_SEC);
  },

  render: function(){
    $.single('.remix[data-id="%s"] > .timelines > .timeline[data-num="%s"]'
      .sprintf(this.model.get('remix').id, this.model.get('timeline').get('num')))
      .append(this.el);
  
    var clip = this.model.get('clip');
    var video = clip.get('video');
    
    this.$el.css({
      top: '',
      background: 'url("%s")'.sprintf(video.get('thumbnail')),
      left: WebRemixer.EMS_PER_SEC * this.model.get('startTime') + 'em',
      width: WebRemixer.EMS_PER_SEC * this.model.get('duration') + 'em'
    }).attr({
      
    });
  }
  
});