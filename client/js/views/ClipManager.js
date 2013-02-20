WebRemixer.Views.ClipManager = WebRemixer.View.extend({
	className: 'clip-manager',
		
	events: {
		'click .clip .inspect' : 'onInspectClick',
						 'click .clip' : 'onInspectClick',
				 'click .new-clip' : 'createNewClip',
							'sortout'    : 'onSortOut',
							'sortover'   : 'onSortOver',
							'sortupdate' : 'onSortUpdate'
	},

	initialize: function(){
		this.$newClip = $('<button class="new-clip"/>').button({
			icons: {
				primary: 'ui-icon-plus'
			},
			label: 'New Clip',
			text: false
		}).appendTo(this.el);
			
		this.$clips = $('<div/>').addClass('clips').sortable({
			tolerance: 'pointer'
		}).appendTo(this.el);
	
		this.listenTo(this.model, 'change:open', this.onVisibilityChange);

		var remix = this.model.get('remix');

		this.listenTo(remix.get('clips'), {
			add: this.onClipsAdd,
			remove: this.onClipsRemove
		});

		this.listenTo(remix, {
			'change:clipIds': this.onClipIdsChange
		});
		
		this.model.trigger('change:open');
	},

	onSortOver: function(event, ui){
		ui.item.addClass('over-manager');
	},

	onSortOut: function(event, ui){
		ui.item.removeClass('over-manager');
	},
	
	onVisibilityChange: function(){
		if (this.model.get('open')){
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

	onClipIdsChange: function(){
		var clipIds = this.model.get('remix').get('clipIds');

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

 onClipsAdd: function(model){
		this.listenTo(model, 'change:' + model.idAttribute, this.onSortUpdate);

		var view = new WebRemixer.Views.Clip({
			model: model
		});

		var clipIds = this.model.get('remix').get('clipIds');

		var order = _.indexOf(clipIds, model.id);

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

	onClipsRemove: function(model){
		this.stopListening(model);

		this.$clips.single('#' + model.cid).data('view').remove();
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