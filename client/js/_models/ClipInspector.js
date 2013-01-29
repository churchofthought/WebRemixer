WebRemixer.Models.ClipInspector = Backbone.Model.extend({

  initialize: function(){
    this.set('videoFinder', new WebRemixer.Models.VideoFinder({
      
    }));
  }
});