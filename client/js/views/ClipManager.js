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
		this.onSortUpdate = _.wrap(this.onSortUpdate, _.defer);

		this.$newClip = $('<button/>').prop('className', 'new-clip').button({
			icons: {
				primary: 'ui-icon-plus'
			},
			label: 'New Clip',
			text: false
		}).appendTo(this.el);
			
		this.$clips = $('<div/>').prop('className', 'clips').sortable({
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
		var $clips = this.$clips;

		$clips.children('.clip').each(function(){
			var $this = $(this);

			var order = $this.data('view').model.get('order');

			$clips.children('.clip').each(function(){
				if (order < $(this).data('view').model.get('order')){
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

		var order = clip.get('order');

		if (order >= 0){
			//insert clip in the correct position
			this.$clips.children('.clip').each(function(){
				if (order < $(this).data('view').model.get('order')){
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