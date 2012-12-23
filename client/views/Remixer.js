WebRemixer.Views.Remixer = Backbone.View.extend({
  className: "remixer",

  initialize: function() {
  
    this.ruler = new WebRemixer.Views.Ruler({
      model: this.model
    });
    this.ruler.$el.appendTo(this.el);
    
    this.render();
  },

  render: function() {
    
  }
});