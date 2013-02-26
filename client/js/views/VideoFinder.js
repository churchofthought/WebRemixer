WebRemixer.Views.VideoFinder = WebRemixer.View.extend({
	className: 'video-finder',
		
	events: {
		dialogopen : 'onOpen',
		dialogclose : 'onClose',
		'change .search': 'onSearchChange',
		'click .video': 'onVideoClick'
	},
	
	initialize: function(){
		this.$search = $('<input type="text"/>').prop('className', 'search').appendTo(
			$('<div/>').attr('data-label', 'Search').appendTo(this.el)
		);
		this.$searchResults = $('<div/>').prop('className', 'search-results').appendTo(this.el);
		
		
		this.listenTo(this.model, 'change:open', this.onVisibilityChange);
		this.listenTo(this.model.get('videos'), {
			add: this.onVideosAdd,
			reset: this.onVideosReset
		});
		//this.$search.val('kaskade');
		//this.onSearchChange();

		$(this.onLoad);
	},
	
	onVideosAdd: function(video){
		this.$searchResults.append(
			new WebRemixer.Views.Video({
				model: video
			}).el
		);
	},
	
	onVideosReset: function(){
		this.$searchResults.children('.video').each(function(){
			$(this).data('view').remove();
		});
	},
	
	onOpen: function(){
		this.model.set('open', true, {silent: true});
	},
	
	onClose: function(){
		this.model.set('open', false, {silent: true});
	},
	
	onVisibilityChange: function(videoFinder, open){
		if (open){
			this.$el.dialog('open');
			this.$search.select();
		}else{
			this.$el.dialog('close');
		}
	},
	
	onVideoClick: function(event){
		this.model.set('video', $(event.currentTarget).data('view').model);
	},
	
	onSearchChange: function(){
		if (this.xhr){
			this.xhr.abort();
		}
		this.model.get('videos').reset();
		this.xhr = $.getJSON('http://gdata.youtube.com/feeds/api/videos', {
			v: 2.1,
			alt: 'jsonc',
			q: this.$search.val()
		}, this.onSearchLoad); 
	},
	
	onSearchLoad: function(res){
		var videos = this.model.get('videos');
		videos.reset();
		var items = res.data.items;
		for (var i = 0; i < items.length; ++i){
			var data = items[i];
			videos.add(
				new WebRemixer.Models.Video({
					sourceVideoId: data.id,
					title: data.title,
					duration: data.duration,
					thumbnail: data.thumbnail.hqDefault
				})
			);
		}
	},
		
	onLoad: function(){
		this.$el.appendTo(document.body).dialog({
			title: 'Find Video',
			autoOpen: false,
			modal: true,
			width: 960,
			height: 600,
			buttons: { 
				Okay: _.bind(this.$el.dialog, this.$el, 'close')
			} 
		});
	}
});