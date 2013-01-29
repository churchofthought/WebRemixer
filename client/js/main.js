(function(){

  window.onYouTubeIframeAPIReady = function(){
  var remixerModel = new WebRemixer.Models.Remix({id: 57});

  remixer = new WebRemixer.Views.Remix({
    model: remixerModel
  });


    $(function(){
      remixer.$el.appendTo(document.body);
    });
    remixerModel.get('timelines').add([
      new WebRemixer.Models.Timeline({num: 1}),
      new WebRemixer.Models.Timeline({num: 3}),
      new WebRemixer.Models.Timeline({num: 4}),
      new WebRemixer.Models.Timeline({num: 2})
    ]);
    
    
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
    /*
    var lineclipModel1 = new WebRemixer.Models.TimelineClip({
      clip: clip,
      startTime: 4,
      duration: 5
    });
    
    var lineclipModel2 = new WebRemixer.Models.TimelineClip({
      clip: clip,
      startTime: 3,
      duration: 5
    });
    
        var lineclipModel3 = new WebRemixer.Models.TimelineClip({
      clip: clip,
      startTime: 1,
      duration: 5
    });
    
        var lineclipModel4 = new WebRemixer.Models.TimelineClip({
      clip: clip,
      startTime: 2,
      duration: 5
    });
    remixerModel.get('timelines').at(0).get('timelineClips').add(lineclipModel1);
    remixerModel.get('timelines').at(1).get('timelineClips').add(lineclipModel2);
    remixerModel.get('timelines').at(2).get('timelineClips').add(lineclipModel3);
    remixerModel.get('timelines').at(3).get('timelineClips').add(lineclipModel4);*/
    
    
  
  }
})();