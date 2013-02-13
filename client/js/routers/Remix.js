WebRemixer.Routers.Remix = Backbone.Router.extend({

  routes: {
    "new": "newRemix",
    ":id": "getRemix"
  },

  newRemix: function() {
    
    var remixModel = new WebRemixer.Models.Remix();
    
    var remixView = new WebRemixer.Views.Remix({
      model: remixModel
    });
    
    remixView.$el.appendTo(document.body);
    
    var timelines = remixModel.get('timelines');
    
    // add some timelines to begin
    for (var count = 5; count--;){
      timelines.add(new WebRemixer.Models.Timeline());
    }
  },

  getRemix: function(id) {
    var attrs = {};
    attrs[Backbone.Model.prototype.idAttribute] = id;
    var remixModel = new WebRemixer.Models.Remix(attrs);
    
    var remixView = new WebRemixer.Views.Remix({
      model: remixModel
    });
    
    remixView.$el.appendTo(document.body);
    
    remixModel.fetch();
  }

});