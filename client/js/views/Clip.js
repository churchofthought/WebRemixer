WebRemixer.Views.Clip = Backbone.View.extend({
  
  className: 'clip',
  
  events: {
    'dragstart'     : 'onDragStart',
    'click .delete' : 'onDeleteClick'
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
        helper: 'clone',
        appendTo: document.body
      });
      
    $('<div/>').addClass('buttons').append(
      $('<button class="inspect"/>').button({
        icons: {
          primary: 'ui-icon-pencil',
        },
        label: 'Inspect',
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
      
    this.listenTo(this.model, {
       change: this.render
    });
    
    this.model.trigger('change');
  },
  
  onDeleteClick: function(){
    this.model.destroy();
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