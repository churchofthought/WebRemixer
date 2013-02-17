WebRemixer.Views.TimelineClip = Backbone.View.extend({
  className: 'timeline-clip',
  
  events: {
    'dragstop': 'onDragStop',
    'resizestop': 'onResizeStop',
    'click .toggle-loop': 'toggleLoop',
    'click .duplicate': 'duplicate',
    'click .delete': 'del'
  },
  
  initialize: function(){
    _.bindAll(this);
  
  
    var grid = [WebRemixer.PX_PER_SEC / 8, 1];

    this.$el.data('view', this).prop(
      'id', this.model.cid
    ).draggable({
      containment: '.timelines',
      stack: '.' + this.className,
      snap: '.timeline',
//      snapTolerance: WebRemixer.PX_PER_SEC / 16,
      grid: grid,
      helper: this.getDraggableHelper
    }).resizable({
      //containment: 'parent',
      handles: 'e,w',
      grid: grid
    }).css(
      'position', 'absolute'
    );
    //set position to absolute, fix for draggable
    
    /*var menu = $(
      '<ul class="timeline-clip-menu">' +
      '<li><a href="#">Item 1</a></li>' +
      '<li><a href="#">Item 2</a></li>' +
      '</ul>'
    ).menu();*/
    
    this.$loopIndicator = $('<div/>').addClass('loop-indicator').appendTo(this.el);
    
    var $buttons = $('<div/>').addClass('buttons');
    
    var $loopLabel = $('<label for="%s"/>'.sprintf(Math.random().toString(36))).appendTo($buttons);

    $buttons.append(
    
      $('<input id="%s" type="checkbox" class="toggle-loop"/>'.sprintf($loopLabel.attr('for'))).appendTo($buttons).button({
        icons: {
          primary: 'ui-icon-refresh'
        },
        label: 'Loop',
        text: false
      }),
      
      $('<button class="duplicate"/>').button({
        icons: {
          primary: 'ui-icon-copy'
        },
        label: 'Duplicate',
        text: false
      }),
      
      $('<button class="delete"/>').button({
        icons: {
          primary: 'ui-icon-close'
        },
        label: 'Delete',
        text: false
      })
      
    ).appendTo(this.el);
    
    
    
    this.listenTo(this.model, {
                change : this.render,
      'change:timeline': this.onTimelineChange,
      'change:selected': this.onSelectedChange
    });

    this.model.trigger('change:selected');

    this.render();
  },
  
  onSelectedChange: function(){
    if (this.model.get('selected')){
      this.$el.addClass('ui-selected');
    }else{
      this.$el.removeClass('ui-selected');
    }
  },
  
  getDraggableHelper: function(){
    this.origDraggableParent = this.$el.parent();
    
    var offset = this.$el.offset();
    
    return this.$el.appendTo(this.$el.closest('.timelines')).offset(offset);
  },
  
  onDragStop: function(){
    if (this.origDraggableParent){
      if (!this.$el.parent('.timeline-clips').length){
        this.$el.appendTo(this.origDraggableParent);
      }
      this.model.set('startTime', (this.$el.position().left - this.origDraggableParent.offset().left) / WebRemixer.PX_PER_SEC);
      this.origDraggableParent = null;
    }
  },
  
  onResizeStop: function(){
    this.model.set({
      startTime: this.$el.position().left / WebRemixer.PX_PER_SEC,
      duration: this.$el.width() / WebRemixer.PX_PER_SEC
    });
  },
  
  toggleLoop: function(){
    this.model.set('loop', !this.model.get('loop'));
  },
  
  duplicate: function(timeDelta){
    var selected = this.model.get('selected');
  
    var clone = new WebRemixer.Models.TimelineClip({
      timeline: this.model.get('timeline'),
      clip: this.model.get('clip'),
      startTime: this.model.get('startTime') + (typeof timeDelta === 'number' && timeDelta || this.model.get('duration')),
      duration: this.model.get('duration'),
      loop: this.model.get('loop'),
      selected: selected
    });

    if (selected){
      this.model.set('selected', false);
    }   
  },
  
  del: function(){
    this.model.destroy();
  },
  
  onTimelineChange: function(){
    this.onDragStop();
    this.render();
  },

  render: function(){
    var clip = this.model.get('clip');
    var video = clip.get('video');
    
    this.$loopIndicator.css({
      'background-size': WebRemixer.EMS_PER_SEC * (this.model.get('loop') ? 
        clip.get('cutDuration') :  
        video.get('duration')
        ) + 'em' + ' 100%'
    });
    
    this.$el.css({
      background: 'url("%s")'.sprintf(video.get('thumbnail')),
      left: WebRemixer.EMS_PER_SEC * this.model.get('startTime') + 'em',
      width: WebRemixer.EMS_PER_SEC * this.model.get('duration') + 'em'
    }).attr({
      'data-title': clip.get('title')
    });
  }
  
});