WebRemixer.Views.Video = Backbone.View.extend({
  className: "video",
  
  initialize: function(){
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  
  render: function(){
    this.$el.css({
      backgroundImage: "url(%s)".sprintf(this.model.get('thumbnail'))
    });
  }
});