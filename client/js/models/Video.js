WebRemixer.Models.Video = Backbone.Model.extend({
  defaults: {

  },
  
  initialize: function(){
    _.bindAll(this);
    

    $.get('https://gdata.youtube.com/feeds/api/videos/%s'.sprintf(this.get('sourceId')), { 
      v: 2.1,
      alt: 'jsonc' 
    }, this.gotVideoData);
  },
  
  gotVideoData: function(res){
    console.log(res);
    var data = res.data;
    
    this.set({
      title: data.title,
      duration: data.duration,
      thumbnail: data.thumbnail.hqDefault
    });
    
  }
});