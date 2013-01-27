WebRemixer.Views.Clip = Backbone.View.extend({
  
  className: 'clip',
  
  events: {
    'dragstart': 'onDragStart'
  },
  
  initialize: function(){
    _.bindAll(this);
    
    this.$el
      .attr({
        id: this.model.cid
      })
      .data('view', this)
      .draggable({
        snap: '.timeline',
        grid: [WebRemixer.PX_PER_SEC / 8, 1],
        helper: 'clone'
      });
      
    $('<div/>').addClass('buttons').append(
      $('<button class="inspect"/>').button({
        icons: {
          primary: 'ui-icon-pencil',
        },
        label: 'Inspect',
        text: false
      })
    ).appendTo(this.el);
      
    this.listenTo(this.model, {
       change: this.render
    });
    
    this.model.trigger('change');
  },
  
  onDragStart: function(){
    if (!this.model.get('video')){
      return false;
    }
  },
  
  render: function(){
    var video = this.model.get('video');
    
    if (video){
      this.$el.css({
        backgroundImage: 'url("%s")'.sprintf(video.get('thumbnail'))
      });
    }
    
    this.$el.attr({
      'data-title': this.model.get('title'),
      'data-duration': this.model.get('cutDuration') + 's'
    });
  }
});