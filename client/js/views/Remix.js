WebRemixer.Views.Remix = Backbone.View.extend({
  className: "remix",

  initialize: function() {
    this.$el.attr({
      "data-id": this.model.id
    });
  
    this.ruler = new WebRemixer.Views.Ruler({
      model: this.model
    });
    this.ruler.$el.appendTo(this.el);
    
    $("<div/>").addClass("timelines").appendTo(this.el);
    
    this.render();
  },

  render: function() {
    
  }
});