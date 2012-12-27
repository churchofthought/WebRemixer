WebRemixer.Views.Remix = Backbone.View.extend({
  className: "remix",
    
  events: {
    'selectablestop' : 'onSelectStop'
  },
  


  initialize: function(){
    _.bindAll(this);
  
    this.$el.attr({
      'data-id': this.model.id
    }).selectable({
      filter: '.timeline-clip'
    });
  
    this.ruler = new WebRemixer.Views.Ruler({
      model: this.model
    });
    this.ruler.$el.appendTo(this.el);
    
    $('<div/>').addClass('timelines').appendTo(this.el);
    
    this.render();
  },

  onSelectStop: function(event, ui){
    //lets snap the selection to the timelines
    //make sure it always covers the timeline heights entirely
    // set visibility to hidden to make sure it doesn't block elementFromPoint call
    var $helper = $.single('body > .ui-selectable-helper').css({
      visibility: 'hidden'
    }); 
    var start = $helper.offset();
    
    // get the timeline that we started selecting on
    // and get the one we ended selecting on
    var startTimelineNum = $(document.elementFromPoint(start.left, start.top))
                        .closest('.timeline')
                        .attr('data-num');
    var endTimelineNum = $(document.elementFromPoint(start.left + $helper.width(), start.top + $helper.height()))
                        .closest('.timeline')
                        .attr('data-num');
                        
    if (!startTimelineNum){
      startTimelineNum = $('.remix[data-id="%s"] > .timelines > .timeline:first-child'.sprintf(this.model.id)).attr('data-num');
    }        
    if (!endTimelineNum){
      endTimelineNum = $('.remix[data-id="%s"] > .timelines > .timeline:last-child'.sprintf(this.model.id)).attr('data-num');
    }
    
    //clear all timelines
    $('.remix[data-id="%s"] > .timelines > .timeline'.sprintf(this.model.id)).css({
      'background-size': ''
    });
    
    for (var i = startTimelineNum; i <= endTimelineNum; ++i){
      var timeline = $.single('.remix[data-id="%s"] > .timelines > .timeline[data-num="%s"]'.sprintf(this.model.id, i))
      .css({
        backgroundPosition: start.left + 'px 0',
        'background-size': $helper.width() + 'px 100%'
      });
    }
    
    $helper.css({
      visibility: ''
    });
  },

  render: function(){
    
  }
});