WebRemixer.Views.ClipInspector = WebRemixer.View.extend({
	className: 'clip-inspector',
		
	events: {
		dialogopen : 'onOpen',
		dialogclose : 'onClose',
		'change .clip-title' : 'onTitleInputChange',
		'slide .cut' : 'onCutSlide',
		'slidestop .cut' : 'onCutSlide',
		'click .clip-video' : 'onVideoClick'
	},
	
	initialize: function(){
		new WebRemixer.Views.VideoFinder({
			model: this.model.get('videoFinder')
		});
		
		this.$title = $('<input type="text"/>')
		.prop('class', 'clip-title')
		.attr('placeholder', 'Title')
		.appendTo(this.el);
			
			
		
		var $cutContainer = $('<div/>').prop('class', 'cut').appendTo($('<div/>').attr('data-label', 'Cut').appendTo(this.el));
		
		this.$cutSlider = $('<div/>').prop('class', 'cut-slider').slider({
			range: true,
			min: 0
		}).appendTo($cutContainer);
		
		this.$cutStart = $('<span/>').prop('class', 'cut-start').appendTo($cutContainer);
		this.$cutEnd = $('<span/>').prop('class', 'cut-end').appendTo($cutContainer);
		
		
		this.$video = $('<div/>').prop('class', 'clip-video').appendTo(
			$('<div/>').attr('data-label', 'Video').appendTo(this.el)
		);
		
		
		
		
		
		this.listenTo(this.model, {
			'change:open': this.onVisibilityChange,
			'change:clip': this.onClipChange
		});
		this.listenTo(this.model.get('videoFinder'), 'change:video', this.onVideoFinderVideoChanged);
		
		$(this.onLoad);
	},
	
	onVideoFinderVideoChanged: function(videoFinder, video){

		if (video){
			this.model.get('clip').set('video', video);
			videoFinder.set('open', false);
		}
		
	},
	
	onVideoClick: function(){
		this.model.get('videoFinder').set({
			video: undefined,
			open: true
		});
	},
	
	onCutSlide: function(event, ui){
		var values = (ui && ui.values) || this.$cutSlider.slider('option', 'values');
	
		var start = values[0];
		var end = values[1];
		
		if (end - start < 1){
			return;
		}
	
		var clip = this.model.get('clip');
		
		var video = clip.get('video');
		
		if (video){
			var duration = video.get('duration');
		
			this.$cutStart.css({
				left: (start / duration) * 100 + "%"
			}).text('%d:%02d'.sprintf(start / 60, start % 60));
			
			this.$cutEnd.css({
				left: (end / duration) * 100 + "%"
			}).text('%d:%02d'.sprintf(end / 60, end % 60));
		}
		
		clip.set({
			cutStart: start,
			cutDuration: end - start
		});
	},
	
	onLoad: function(){
		this.$el.appendTo(document.body).dialog({
			title: 'Edit Clip',
			autoOpen: false,
			modal: true,
			width: 600,
			height: 500,
			buttons: { 
				Okay: _.bind(this.$el.dialog, this.$el, 'close')
			} 
		});
	},
	
	onVisibilityChange: function(clipInspector, open){
		if (open){
			this.$el.dialog('open');
		}else{
			this.$el.dialog('close');
			this.removeBlankClips();
		}
	},
	
	removeBlankClips: function(){
		var clip = this.model.get('clip');
		if (!clip.get('video')){
			clip.destroy();
		}
	},
	
	onOpen: function(){
		this.model.set('open', true, {silent: true});
	},
	
	onClose: function(){
		this.model.set('open', false, {silent: true});
	},
	
	onClipChange: function(clipInspector, clip){
		var cutStart = clip.get('cutStart');
	
		this.$title.val(clip.get('title'));
		var video = clip.get('video');
		
		this.$cutSlider.slider('option', {
			values: [cutStart, cutStart + clip.get('cutDuration')]
		});
		
		var previousClip = this.model.previous('clip');
		if (previousClip){
			this.stopListening(previousClip);
		}
		
		this.listenTo(clip, 'change:title', this.onClipTitleChange);
		this.listenTo(clip, 'change:video', this.onClipVideoChange);
		
		//kickstart it
		this.onCutSlide();
		this.onClipVideoChange(clip, clip.get('video'));
	},
	
	onClipVideoChange: function(clip, video){
		
		var oldView = this.$video.children().data('view');
		if (oldView){
			oldView.remove();
		}

		if (video){
			this.$video.append(
				new WebRemixer.Views.Video({
					model: video
				}).el
			);
			
			var previousVideo = clip.previous('video');
		
			if (previousVideo && clip.get('title') === previousVideo.get('title')){
				clip.set('title', video.get('title'));
			}
		
			this.$cutSlider.slider('option', {
				max: video.get('duration')
			});
			
			this.onCutSlide();
		}else{
			this.model.get('videoFinder').set('open', true);
		}
	},

	onClipTitleChange: function(clip, title){
		this.$title.val(title);
	},
	
	onTitleInputChange: function(){
		var clip = this.model.get('clip');
		var title = this.$title.val();
		clip.set('title', _.isEmpty(title) ? clip.get('video').get('title') : title);
	},
	
	
});