WebRemixer.Models.Clip = Backbone.Model.extend({

  defaults: {
    video: null,
    cutStart: 0,
    cutDuration: 0
  },
  
  initialize: function(){
    this.onVideoTitleChange();
    this.listenTo(this.get('video'), 'change:title', this.onVideoTitleChange);
    this.listenTo(this.get('video'), 'change', _.bind(this.trigger, this, "change"));
  },
  
  onVideoTitleChange: function(){
    if (!this.get('title')){
      this.set('title', this.get('video').get('title'));
    }
  }
  
});