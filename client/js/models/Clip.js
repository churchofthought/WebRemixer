WebRemixer.Models.Clip = Backbone.Model.extend({

  defaults: {
    cutStart: 0,
    cutDuration: 5
  },

  initialize: function(){
    this.listenTo(this, 'change:video', this.onVideoChange);
    this.trigger('change:video');
  },
  
  onVideoChange: function(){
    var video = this.get('video');
    
    var previousVideo = this.previous('video');
    this.stopListening(previousVideo);
    
    if (!video) return;
    
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