(function(){

  var remixerModel = new WebRemixer.Models.Remix({id: 57});

  var remixer = new WebRemixer.Views.Remix({
    model: remixerModel
  });

  $(function(){
    remixer.$el.appendTo(document.body);
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
      sourceId: "OMhEbjZK3WM"
    });
    
    var clip = new WebRemixer.Models.Clip({
      video: video,
      cutDuration: 5,
      cutStart: 10
    });
    
    var clipview = new WebRemixer.Views.Clip({model:clip});
    
    var videoView = new WebRemixer.Views.Video({model: video});
    clipview.$el.appendTo(document.body);
    
    var lineclipModel = new WebRemixer.Models.TimelineClip({
      clip: clip,
      timeline: timeline.model,
      remix: remixerModel
    });
    var lineclip = new WebRemixer.Views.TimelineClip({model:lineclipModel});
  });
  
})();