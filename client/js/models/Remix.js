WebRemixer.Models.Remix = WebRemixer.Model.extend({
	urlRoot: 'remixes',
	
	includeInJSON: {title: String, timelineIds: Array, clipIds: Array},

	defaults: {
		duration: 200,
		playTime: 0
	},

	initialize: function(){
		this.onChange = _.debounce(this.onChange, WebRemixer.Config.saveOnChangeDelay);

		var opts = {
			remix: this
		};

		if (!_.isArray(this.get('timelineIds'))){
			this.set('timelineIds', []);
		}

		if (!_.isArray(this.get('clipIds'))){
			this.set('clipIds', []);
		}

		this.set({
						mainMenu: new WebRemixer.Models.MainMenu(opts),
				playControls: new WebRemixer.Models.PlayControls(opts),
							 ruler: new WebRemixer.Models.Ruler(opts),
			 clipInspector: new WebRemixer.Models.ClipInspector(opts),
					 timelines: new WebRemixer.Collections.Timelines(),
							 clips: new WebRemixer.Collections.Clips()
		});
		
		this.set({
			 clipManager: new WebRemixer.Models.ClipManager(opts),
			 timelineManager: new WebRemixer.Models.TimelineManager(opts),
			 playerManager: new WebRemixer.Models.PlayerManager(opts),
			 selection: {}
		});
		
		this.listenTo(this, 'change', this.onChange);

		this.listenTo(this, 'change:' + this.idAttribute, this.onChangeId);
		
		if (this.id) {
			this.fetchChildren();
		}
	},

	onChange: function(){
		this.save();
	},

	onChangeId: function(){
		WebRemixer.router.navigate(this.id);
	},
	
	fetchChildren: function(){
		$.get(this.url() + '/children', this.onFetchedChildren);
	},
	
	onFetchedChildren: function(res){
		WebRemixer.Models.Remix.createOrUpdate([res.remix]);

		WebRemixer.Models.Clip.createOrUpdate(res.clips);
		
		WebRemixer.Models.Timeline.createOrUpdate(res.timelines);
		
		WebRemixer.Models.TimelineClip.createOrUpdate(res.timelineClips);

		this.trigger('fetchedChildren');
	}

});