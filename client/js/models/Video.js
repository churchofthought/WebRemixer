WebRemixer.Models.Video = Backbone.Model.extend({

  initialize: function(){
    _.bindAll(this);
    
    
    if (!this.get('title')){
      $.get('https://gdata.youtube.com/feeds/api/videos/%s'.sprintf(this.get('sourceVideoId')), { 
        v: 2.1,
        alt: 'jsonc' 
      }, this.gotVideoData);
    }
  },
  
  gotVideoData: function(res){
    var data = res.data;
    
    this.set({
      title: data.title,
      duration: data.duration,
      thumbnail: data.thumbnail.hqDefault
    });
  }
});