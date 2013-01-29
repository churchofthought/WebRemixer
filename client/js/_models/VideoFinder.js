WebRemixer.Models.VideoFinder = Backbone.Model.extend({
  initialize: function(){
    this.set('videos', new WebRemixer.Collections.Videos());
  }
});