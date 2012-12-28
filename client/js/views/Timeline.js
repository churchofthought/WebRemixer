WebRemixer.Views.Timeline = Backbone.View.extend({
  className: 'timeline',

  initialize: function(){
    _.bindAll(this);
  
    this.$el
      .attr({'data-num': this.model.get('num')})
      .data('view', this);
      
    this.$clips = $('<div/>').addClass('timeline-clips').droppable({
      accept: '.video, .clip, .timeline-clip',
      drop: this.onDrop
    }).appendTo(this.el);
      
    $('<div/>').addClass('selection').appendTo(this.el);
      
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
    
    this.listenTo(this.model.get('remix'), 'change:selection', this.onSelectionChange);
  },
  
  duplicateSelection: function(){
    var selection = this.model.get('selection');
    if (!selection) return;
    
    var $selectedClips = this.$clips.find('.timeline-clip.ui-selected');
    if (!$selectedClips.size()) return;
    
    $selectedClips.each(function(){
      $(this).data('view').duplicate(selection.duration);
    })
  },
  
  onSelectionChange: function(){
  
    var selection = this.model.get('remix').get('selection');
    
    var offset = this.$el.offset();
    var height = this.$el.height();
    
    var $selection = this.$el.single('.selection');
    
    //make sure selection is at least 1x1 and check for the 3 types of intersections
    if (selection.width >= 1 && selection.height >= 1 &&
        ((selection.offset.top >= offset.top && selection.offset.top <= offset.top + height)
        || (selection.offset.top + selection.height >= offset.top && selection.offset.top + selection.height <= offset.top + height)
        || (selection.offset.top <= offset.top && selection.offset.top + selection.height >= offset.top + height))) {
      $selection.css({
        left: selection.offset.left,
        width: selection.width
      });
      this.model.set('selection', {
        startTime: selection.offset.left / WebRemixer.PX_PER_SEC,
        duration: selection.width / WebRemixer.PX_PER_SEC
      });
    }else{
      $selection.css({
        width: 0
      });
      this.model.set('selection', null);
    }
  },
  
  onDrop: function(event, ui){
    var view = ui.draggable.data('view');
    view.onDragStop();
    view.model.set('timeline', this.model);
  },
  
  render: function(){
    
  }
});