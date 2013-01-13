WebRemixer.Models.Clip = Backbone.Model.extend({

  initialize: function(){
    var video = this.get('video');
  
    this.listenTo(video, {
       change: _.bind(this.trigger, this, "change"),
      'change:title': this.onVideoTitleChange
    });
    
    video.trigger('change:title');
  },
  
  onVideoTitleChange: function(){
    if (!this.get('title')){
      this.set('title', this.get('video').get('title'));
    }
  }
  
});