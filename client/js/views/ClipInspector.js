WebRemixer.Views.ClipInspector = Backbone.View.extend({
  className: 'clip-inspector',
    
  events: {
    'dialogopen' : 'onOpen',
    'dialogclose' : 'onClose',
    'change .clip-title' : 'onTitleInputChange',
    'slide .cut' : 'onCutSlide',
    'slidestop .cut' : 'onCutSlide',
    'click .video' : 'onVideoClick'
  },
  
  initialize: function(){
    _.bindAll(this);
    
    new WebRemixer.Views.VideoFinder({
        model: this.model.get('videoFinder')
    });
    
    this.$title = $('<input class="clip-title" type="text"/>')
      .appendTo(
        $('<div data-label="Title"/>').appendTo(this.el)
      );
      
      
    
    var $cutContainer = $('<div class="cut"/>').appendTo($('<div data-label="Cut"/>').appendTo(this.el));
    
    this.$cutSlider = $('<div class="cut-slider"/>').slider({
      range: true,
      min: 0
    }).appendTo($cutContainer);
    
    this.$cutStart = $('<span class="cut-start"/>').appendTo($cutContainer);
    this.$cutEnd = $('<span class="cut-end"/>').appendTo($cutContainer);
    
    
    this.$video = $('<div class="video"/>').appendTo(
      $('<div data-label="Video"/>').appendTo(this.el)
    );
    
    
    
    
    
    this.listenTo(this.model, {
      'change:open': this.onVisibilityChange,
      'change:clip': this.onClipChange
    });
    this.listenTo(this.model.get('videoFinder'), 'change:video', this.onVideoFinderVideoChanged);
    
    $(this.onLoad);
  
    this.render();
  },
  
  onVideoFinderVideoChanged: function(){
    var videoFinder = this.model.get('videoFinder');
  
    this.model.get('clip').set('video', 
      videoFinder.get('video')
    );
    
    videoFinder.set('open', false);
  },
  
  onVideoClick: function(){
    this.model.get('videoFinder').set('open', true);
  },
  
  onCutSlide: function(event, ui){
    var values = (ui && ui.values) || this.$cutSlider.slider('option', 'values');
  
    var start = values[0];
    var end = values[1];
    
    if (end - start < 1){
      return;
    }
  
    var clip = this.model.get('clip');
  
    var duration = clip.get('video').get('duration');
  
    this.$cutStart.css({
      left: (start / duration) * 100 + "%"
    }).text('%d:%02d'.sprintf(start / 60, start % 60));
    
    this.$cutEnd.css({
      left: (end / duration) * 100 + "%"
    }).text('%d:%02d'.sprintf(end / 60, end % 60));
    
    clip.set({
      cutStart: start,
      cutDuration: end - start
    });
  },
  
  onLoad: function(){
    this.$el.appendTo(document.body).dialog({
      title: 'Inspect Clip',
      autoOpen: false,
      modal: true,
      width: 600,
      height: 500
    });
  },
  
  onVisibilityChange: function(){
    if (this.model.get('open')){
      this.$el.dialog('open');
    }else{
      this.$el.dialog('close');
    }
  },
  
  onOpen: function(){
    this.model.set('open', true);
  },
  
  onClose: function(){
    this.model.set('open', false);
  },
  
  onClipChange: function(){
    var clip = this.model.get('clip');
    var cutStart = clip.get('cutStart');
  
    this.$title.val(clip.get('title'));
    this.$cutSlider.slider('option', {
      max: clip.get('video').get('duration'),
      values: [cutStart, cutStart + clip.get('cutDuration')]
    });
    //kickstart it
    this.onCutSlide();
    this.onClipVideoChange();
    
    this.listenTo(clip, 'change:title', this.onClipTitleChange);
    this.listenTo(clip, 'change:video', this.onClipVideoChange);
    
    var previousClip = this.model.previous('clip');
    if (previousClip){
      this.stopListening(previousClip);
    }
  },
  
  onClipVideoChange: function(){
    var clip = this.model.get('clip');
    var video = clip.get('video');
  
    var videoView = new WebRemixer.Views.Video({
      model: video,
      el: this.$video
    });
    
    if (clip.get('title') == clip.previous('video').get('title')){
      clip.set('title', video.get('title'));
    }
  },
  
  onTitleInputChange: function(){
    var clip = this.model.get('clip');
    clip.set('title', this.$title.val() || clip.get('video').get('title'));
    this.onClipTitleChange();
  },
  
  onClipTitleChange: function(){
    this.$title.val(this.model.get('clip').get('title'));
  },
  
  render: function(){
    
  }
});