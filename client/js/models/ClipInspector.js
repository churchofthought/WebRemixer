WebRemixer.Models.ClipInspector = Backbone.Model.extend({
  defaults: {

  },
  
  initialize: function(){
    this.set('videoFinder', new WebRemixer.Models.VideoFinder({
      
    }));
  }
});