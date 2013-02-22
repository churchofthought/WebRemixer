WebRemixer.Views.ClipManager = WebRemixer.View.extend({
	className: 'clip-manager',
		
	events: {
		'click .clip .inspect' : 'onInspectClick',
						 'click .clip' : 'onInspectClick',
				 'click .new-clip' : 'createNewClip',
							sortout    : 'onSortOut',
							sortover   : 'onSortOver',
							sortupdate : 'onSortUpdate'
	},

	initialize: function(){
		this.$newClip = $('<button/>').prop('class', 'new-clip').button({
			icons: {
				primary: 'ui-icon-plus'
			},
			label: 'New Clip',
			text: false
		}).appendTo(this.el);
			
		this.$clips = $('<div/>').prop('class', 'clips').sortable({
			tolerance: 'pointer'
		}).appendTo(this.el);
	
		this.listenTo(this.model, 'change:open', this.onVisibilityChange);

		var remix = this.model.get('remix');

		this.listenTo(remix.get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});

		this.listenTo(remix, 'change:clipIds', this.onClipIdsChange);
		
		this.onVisibilityChange(this.model, this.model.get('open'));

		$(this.onLoad);
	},

	onLoad: function(){
		this.$el.appendTo(document.body);
	},

	onSortOver: function(event, ui){
		ui.item.addClass('over-manager');
	},

	onSortOut: function(event, ui){
		ui.item.removeClass('over-manager');
	},
	
	onVisibilityChange: function(clipManager, open){
		if (open){
			this.$el.addClass('open');
		}else{
			this.$el.removeClass('open');
		}
	},
	
	createNewClip: function(){
		var clip =
			new WebRemixer.Models.Clip({
				remix: this.model.get('remix')
			});

		clip.save();

		this.inspect( clip );
	},

	onClipIdsChange: function(remix, clipIds){
		var $clips = this.$clips.children('.clip');

		$clips.each(function(){
			var $this = $(this);

			var order = _.indexOf(clipIds, $this.data('view').model.id);

			$clips.each(function(){
				if (order < _.indexOf(clipIds, $(this).data('view').model.id)){
					$this.insertBefore(this);
					return false;
				}
			});

		});

	},

	onSortUpdate: function(event, ui){
		this.model.get('remix').set('clipIds',
			this.$clips.children('.clip').map(function(){
				return $(this).data('view').model.id;
			}).get()
		);
	},

 onClipsAdd: function(clip){
		this.listenTo(clip, 'change:' + clip.idAttribute, this.onSortUpdate);

		var view = new WebRemixer.Views.Clip({
			model: clip
		});

		var clipIds = this.model.get('remix').get('clipIds');

		var order = _.indexOf(clipIds, clip.id);

		if (order !== -1){
			//insert clip in the correct position
			this.$clips.children('.clip').each(function(){
				if (order < _.indexOf(clipIds, $(this).data('view').model.id)){
					view.$el.insertBefore(this);
					return false;
				}
			});
		}

		//if not inserted, insert the clip
		if (!view.$el.parent().length){
			this.$clips.append(view.el);
		}
	},

	onClipsRemove: function(clip){
		this.stopListening(clip);

		this.$clips.single('#' + clip.cid).data('view').remove();
	},
	
	onInspectClick: function(event){
		this.inspect($(event.currentTarget).closest('.clip').data('view').model);
	},
	
	inspect: function(clip){
		this.model.get('remix').get('clipInspector').set({
			open: true,
			clip: clip
		});
	}
});