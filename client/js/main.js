(function(){

  var remixer = new WebRemixer.Views.Remixer({
    model: new WebRemixer.Models.Remixer({id: 57})
  });

  $(function(){
    remixer.$el.appendTo(document.body);
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remixerId: 57, num: 1})
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remixerId: 57, num: 4})
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remixerId: 57, num: 3})
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remixerId: 57, num: 2})
    });
    
    var video = new WebRemixer.Models.Video({
      videoId: "OMhEbjZK3WM"
    });
    
    var videoView = new WebRemixer.Views.Video({model: video});
    videoView.$el.appendTo(document.body);
  });
  
})();