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
    
    this.$el.data("view", this).draggable({
      containment: '.timelines',
      stack: '.' + this.className,
//      snap: '.timeline',
//      snapTolerance: WebRemixer.PX_PER_SEC / 16,
      grid: grid
    }).resizable({
      containment: 'parent',
      handles: 'e,w',
      grid: grid
    }).css({
      position: 'absolute'
    });
    //set position to absolute, fix for draggable
    
    /*var menu = $(
      '<ul class="timeline-clip-menu">' +
      '<li><a href="#">Item 1</a></li>' +
      '<li><a href="#">Item 2</a></li>' +
      '</ul>'
    ).menu();*/
    
    var $buttons = $('<div class="buttons"/>');
    
    var $loopLabel = $('<label for="%s"/>'.sprintf(Math.random().toString(36))).appendTo($buttons);

    $buttons.append(
    
      $('<input id="%s" type="checkbox" class="toggle-loop"/>'.sprintf($loopLabel.attr('for'))).appendTo($buttons).button({
        icons: {
          primary: 'ui-icon-refresh',
        },
        label: 'Loop',
        text: false
      }),
      
      $('<button class="duplicate"/>').button({
        icons: {
          primary: 'ui-icon-copy',
        },
        label: 'Duplicate',
        text: false
      }),
      
      $('<button class="delete"/>').button({
        icons: {
          primary: 'ui-icon-close',
        },
        label: 'Delete',
        text: false
      })
      
    ).appendTo(this.el);
    
    
    
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'change:timeline', this.onTimelineChange);
    this.listenTo(this.model, 'destroy', this.remove);
    
    //kickstart it
    this.onTimelineChange();
    this.render();
  },
  
  onDragStop: function(){
    this.model.set('startTime', this.$el.position().left / WebRemixer.PX_PER_SEC);
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
    var clone = this.model.clone();
    clone.set('startTime', this.model.get('startTime') + (typeof timeDelta === 'number' && timeDelta || this.model.get('duration')));
    var newView = new WebRemixer.Views.TimelineClip({
      model: clone
    });
    if (this.$el.hasClass("ui-selected")){
      newView.$el.addClass("ui-selected");
      this.$el.removeClass("ui-selected");
    }   
  },
  
  del: function(){
    this.model.destroy();
  },
  
  onTimelineChange: function(){
    $.single('.remix[data-id="%s"] > .timelines > .timeline[data-num="%s"] > .timeline-clips'
      .sprintf(this.model.get('remix').id, this.model.get('timeline').get('num')))
      .append(this.el);
  },

  render: function(){
    var clip = this.model.get('clip');
    var video = clip.get('video');
    
    this.$el.css({
      top: '',
      background: 'url("%s")'.sprintf(video.get('thumbnail')),
      'background-size': WebRemixer.EMS_PER_SEC * (this.model.get('loop') ? 
        clip.get('cutDuration') :  
        video.get('duration')
        ) + 'em' + ' 100%',
      left: WebRemixer.EMS_PER_SEC * this.model.get('startTime') + 'em',
      width: WebRemixer.EMS_PER_SEC * this.model.get('duration') + 'em'
    }).attr({
      'data-title': clip.get('title')
    });
  }
  
});