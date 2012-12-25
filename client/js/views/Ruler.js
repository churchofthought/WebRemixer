WebRemixer.Views.Ruler = Backbone.View.extend({
  className: "ruler",
  
  initialize: function() {
    this.listenTo(this.model, "change:duration", this.render);
    this.render();
  },
  
  render: function() {
    this.$el.empty();
    for (var i = 0, duration = this.model.get("duration"); i <= duration; ++i){
      this.$el.append($("<div/>").text(i).append("<div/>"));
    }
  }
});