WebRemixer.Views.Remix = Backbone.View.extend({
  className: "remix",
    
  events: {
    'selectablestart' : 'onSelectStart',
    'selectableselecting' : 'onSelecting',
    'selectableunselecting' : 'onUnselecting',
    'selectableselected' : 'onSelected',
    'selectableunselected' : 'onUnselected',
    'selectablestop' : 'onSelectStop',
    'menuselect' : 'onMenuSelect',
    'contextmenu .timeline-clips' : 'onContextMenu',
    'contextmenu .selection' : 'onContextMenu',
    'mousedown .timelines' : 'onTimelinesMousedown'
  },
  


  initialize: function(){
    _.bindAll(this);
  
    this.$el.attr({
      id: this.model.cid
    });
    
    this.playControls = new WebRemixer.Views.PlayControls({
      model: this.model.get('playControls')
    });
    this.playControls.$el.appendTo(this.el);
  	
    
    this.$contextMenu = $('<ul/>')
      .addClass('context-menu')
      .append('<li data-cmd="duplicate"><a><span class="ui-icon ui-icon-copy"></span>Duplicate</a></li>')
      .append('<li data-cmd="delete"><a><span class="ui-icon ui-icon-close"></span>Delete</a></li>')
      .menu()
      .appendTo(this.el);
  
    this.ruler = new WebRemixer.Views.Ruler({
      model: this.model.get('ruler')
    });
    this.ruler.$el.appendTo(this.el);
    
    this.clipManager = new WebRemixer.Views.ClipManager({
      model: this.model.get('clipManager')
    });
    this.clipManager.$el.appendTo(this.el);
    
    this.clipInspector = new WebRemixer.Views.ClipInspector({
      model: this.model.get('clipInspector')
    });
    
    this.$timelines = $('<div/>')
      .addClass('timelines')
      .selectable({
        filter: '.timeline-clip'
      }).appendTo(this.el);
      
    this.listenTo(this.model.get('timelines'), {
      add: this.onTimelinesAdd,
      remove: this.onTimelinesRemove
    });
    
    this.render();
  },
  
  onTimelinesAdd: function(model){
    var view = new WebRemixer.Views.Timeline({
      model: model
    });
  
    //insert timeline in the correct position
    this.$timelines.children('.timeline').each(function(){
      if ($(this).attr('data-num') > model.get('num')){
        view.$el.insertBefore(this);
        return false;
      }
    });
    
    //if not inserted, insert the timeline
    if (!view.$el.parent().length){
      this.$timelines.append(view.el);
    }
  },
  
  onTimelinesRemove: function(model){
    this.$timelines.single('#' + model.cid).data('view').remove();
  },
  
  onContextMenu: function(event){
    event.stopPropagation();
    event.preventDefault();
    
    this.$contextMenu.css({
      left: event.pageX,
      top: event.pageY
    }).addClass('show');
  },
  
  onMenuSelect : function(event, ui){
  
    this.$contextMenu.removeClass('show');
    
    switch (ui.item.attr('data-cmd')){
      case 'duplicate':
        this.$timelines.children('.timeline').each(function(){
          $(this).data('view').duplicateSelection();
        });
        this.shiftSelectionRight();
      break;
      
      case 'delete':
        this.$timelines.children('.timeline').each(function(){
          $(this).data('view').deleteSelection();
        });
      break;
      
    }
  },
  
  shiftSelectionRight: function(){
    var curSelection = this.model.get('selection');
    curSelection.offset.left += curSelection.width;
    this.model.trigger('change:selection');
  },
  
  onTimelinesMousedown: function(){
    this.$contextMenu.removeClass('show');
  },
  
  onSelecting: function(event, ui){
    $(ui.selecting).data('view').model.set('selected', true);
  },
  
  onSelected: function(event, ui){
    $(ui.selected).data('view').model.set('selected', true);
  },
  
  onUnselecting: function(event, ui){
    $(ui.unselecting).data('view').model.set('selected', false);
  },
  
  onUnselected: function(event, ui){
    $(ui.unselected).data('view').model.set('selected', false);
  },
  
  onSelectStart: function(){
    _.defer(this.afterSelectStart);
  },
  
  afterSelectStart: function(){
    this.$helper = $.single('body > .ui-selectable-helper');
    this.updateSelection(true);
  },
  
  updateSelection: function(repeat){
    this.model.set('selection', {
      offset: this.$helper.offset(),
      width: this.$helper.width(),
      height: this.$helper.height()
    });
    if (repeat){
      this.updateSelectionTimeoutID = _.delay(this.updateSelection, 50, true);
    }
  },

  onSelectStop: function(event, ui){
    this.updateSelection();
    clearTimeout(this.updateSelectionTimeoutID);
  },

  render: function(){
    
  }
});