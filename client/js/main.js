(function(){

  window.onYouTubeIframeAPIReady = function(){
  var remixerModel = new WebRemixer.Models.Remix({id: 57, playTime: 7});

  var remixer = new WebRemixer.Views.Remix({
    model: remixerModel
  });


    $(function(){
      remixer.$el.appendTo(document.body);
    });
    var timeline = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 1})
    });
    var timeline2 = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 4})
    });
    var timeline3 = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 3})
    });
    var timeline4 = new WebRemixer.Views.Timeline({
      model: new WebRemixer.Models.Timeline({remix: remixerModel, num: 2})
    });
    
    var video = new WebRemixer.Models.Video({
      sourceVideoId: "OMhEbjZK3WM"
    });
    
    var clip = new WebRemixer.Models.Clip({
      video: video,
      cutDuration: 5,
      cutStart: 10
    });
    
    remixerModel.get('clips').add(clip);
    
    var videoView = new WebRemixer.Views.Video({model: video});
    
    var lineclipModel = new WebRemixer.Models.TimelineClip({
      clip: clip,
      timeline: timeline.model,
      remix: remixerModel,
      startTime: 5,
      duration: 5
    });
    var lineclip = new WebRemixer.Views.TimelineClip({model:lineclipModel});
    
        var lineclipModel = new WebRemixer.Models.TimelineClip({
      clip: clip,
      timeline: timeline.model,
      remix: remixerModel,
      startTime: 10,
      duration: 5
    });
    var lineclip = new WebRemixer.Views.TimelineClip({model:lineclipModel});
    
        var lineclipModel = new WebRemixer.Models.TimelineClip({
      clip: clip,
      timeline: timeline2.model,
      remix: remixerModel,
      startTime: 5,
      duration: 5
    });
    var lineclip = new WebRemixer.Views.TimelineClip({model:lineclipModel});
    
        var lineclipModel = new WebRemixer.Models.TimelineClip({
      clip: clip,
      timeline: timeline4.model,
      remix: remixerModel,
      startTime: 5,
      duration: 5
    });
    var lineclip = new WebRemixer.Views.TimelineClip({model:lineclipModel});
    
    
  
  }
})();