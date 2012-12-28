WebRemixer.Views.Remix = Backbone.View.extend({
  className: "remix",
    
  events: {
    'selectablestop' : 'onSelectStop',
    'menuselect' : 'onMenuSelect',
    'contextmenu .timelines' : 'onContextMenu',
    'mousedown .timelines' : 'onTimelinesMousedown',
  },
  


  initialize: function(){
    _.bindAll(this);
  
    this.$el.attr({
      'data-id': this.model.id
    });
    
    this.$contextMenu = $('<ul/>')
      .addClass('context-menu')
      .append('<li data-cmd="duplicate"><a><span class="ui-icon ui-icon-copy"></span>Duplicate Selection</a></li>')
      .menu()
      .appendTo(this.el);
  
    this.ruler = new WebRemixer.Views.Ruler({
      model: this.model
    });
    this.ruler.$el.appendTo(this.el);
    
    this.$timelines = $('<div/>')
      .addClass('timelines')
      .selectable({
        filter: '.timeline-clip'
      }).appendTo(this.el);
    
    this.render();
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

  onSelectStop: function(event, ui){
  
    var $helper = $.single('body > .ui-selectable-helper');

    this.model.set('selection', {
      offset: $helper.offset(),
      width: $helper.width(),
      height: $helper.height()
    });
  },

  render: function(){
    
  }
});