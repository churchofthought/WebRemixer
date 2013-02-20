WebRemixer.Models.Video = WebRemixer.Model.extend({

	urlRoot: 'videos',
	
	defaults: {
		source: 'youtube'
	},
	
	includedAsObject: true,
	includeInJSON: {source: String, sourceVideoId: String},

	initialize: function(){
		if (!this.get('title')){
			$.getJSON('https://gdata.youtube.com/feeds/api/videos/%s'.sprintf(this.get('sourceVideoId')), { 
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