WebRemixer.Views.Video = Backbone.View.extend({
  className: 'video',
  
  initialize: function(){
    this.$el.draggable({
      
    });
  
    this.listenTo(this.model, 'change', this.render);
    
    this.render();
  },
  
  getFormattedDuration: function(){
    var duration = this.model.get('duration');
    return '%d:%02d'.sprintf(duration / 60, duration % 60);
  },
  
  render: function(){
    this.$el.css({
      backgroundImage: 'url("%s")'.sprintf(this.model.get('thumbnail'))
    }).attr({
      'data-title': this.model.get('title'),
      'data-duration': this.getFormattedDuration()
    });
  }
});