WebRemixer.Views.Clip = Backbone.View.extend({
  
  className: "clip",
  
  initialize: function(){
    this.listenTo(this.model.get('video'), 'change', this.render);
    this.render();
  },
  
  render: function(){
    var video = this.model.get('video');
    
    this.$el.css({
      backgroundImage: "url(%s)".sprintf(video.get('thumbnail'))
    }).attr({
      "data-title": this.model.get('title') || this.model.get('video').get('title'),
      "data-duration": this.model.get('cutDuration') + "s"
    });
  }
});