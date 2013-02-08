WebRemixer.Models.Clip = Backbone.RelationModel.extend({

  defaults: {
    cutStart: 0,
    cutDuration: 5,
    title: 'New Clip'
  },

  initialize: function(){
    this.listenTo(this, 'change:video', this.onVideoChange);
    this.trigger('change:video');
  },
  
  onVideoChange: function(){
    var video = this.get('video');
    
    var previousVideo = this.previous('video');
    if (previousVideo){
      this.stopListening(previousVideo);
    }
    
    if (video){
      this.listenTo(video, {
         change: _.bind(this.trigger, this, 'change'),
        'change:title': this.onVideoTitleChange
      });
      
      video.trigger('change:title');
    }
  },
  
  onVideoTitleChange: function(){
    var title = this.get('title');
    if (!title || title == this.defaults.title){
      this.set('title', this.get('video').get('title'));
    }
  }
  
});