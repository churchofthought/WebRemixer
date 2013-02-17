WebRemixer.Routers.Remix = Backbone.Router.extend({

  routes: {
    "new": "newRemix",
    ":id": "getRemix"
  },

  newRemix: function() {
    
    var remix = new WebRemixer.Models.Remix();
    
    new WebRemixer.Views.Remix({
      model: remix
    }).$el.appendTo(document.body);
    
    // add some timelines to begin
    for (var count = 5; count--;){
      new WebRemixer.Models.Timeline({remix: remix}).save();
    }

    remix.save();
  },

  getRemix: function(id) {
    var attrs = {};
    attrs[WebRemixer.Models.idAttribute] = id;

    var remix = new WebRemixer.Models.Remix(attrs);
    
    new WebRemixer.Views.Remix({
      model: remix
    }).$el.appendTo(document.body);
    
    remix.fetch();
  }

});