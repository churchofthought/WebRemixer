(function(){

  window.onYouTubeIframeAPIReady = function(){
  var remixerModel = new WebRemixer.Models.Remix({id: 57, playTime: 0});

  var remixer = new WebRemixer.Views.Remix({
    model: remixerModel
  });


    $(function(){
      remixer.$el.appendTo(document.body);
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 1})
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 4})
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 3})
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 2})
    });
    
    var video = new WebRemixer.Models.Video({
      ytVideoId: "OMhEbjZK3WM"
    });
    
    var videoPlayer = new WebRemixer.Models.VideoPlayer({
      video: video
    });
    
    var videoPlayerView = new WebRemixer.Views.VideoPlayer({
      el: $("<div/>").appendTo(document.body),
      model: videoPlayer
    });
    
    var clip = new WebRemixer.Models.Clip({
      video: video,
      cutDuration: 5,
      cutStart: 10,
      remix: remixerModel
    });
    
    var clipview = new WebRemixer.Views.Clip({model:clip});
    
    var videoView = new WebRemixer.Views.Video({model: video});
    
    var lineclipModel = new WebRemixer.Models.TimelineClip({
      clip: clip,
      timeline: timeline.model,
      remix: remixerModel,
      startTime: 5,
      duration: 5
    });
    var lineclip = new WebRemixer.Views.TimelineClip({model:lineclipModel});
  
  }
})();