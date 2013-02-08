WebRemixer.Routers.Remix = Backbone.Router.extend({

  routes: {
    "new": "newRemix",
    ":id": "getRemix"
  },

  newRemix: function() {
    var remixModel = new WebRemixer.Models.Remix({name: 'New Remix'});
    
    var remixView = new WebRemixer.Views.Remix({
      model: remixModel
    });
    
    remixView.$el.appendTo(document.body);
    
    var timelines = remixModel.get('timelines');
    
    // add some timelines to begin
    for (var num = 1; num < 5; ++num){
      timelines.add(new WebRemixer.Models.Timeline({num: num}))
    }
  
    remixModel.save();
  },

  getRemix: function() {
    console.log('getRemix~!');
  }

});