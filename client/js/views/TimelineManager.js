WebRemixer.Views.TimelineManager = WebRemixer.View.extend({
	className: 'timelines',
		
	events: {
		selectablestart : 'onSelectStart',
		selectableselecting : 'onSelecting',
		selectableunselecting : 'onUnselecting',
		selectableselected : 'onSelected',
		selectableunselected : 'onUnselected',
		selectablestop : 'onSelectStop',
		'contextmenu .timeline-clips' : 'onContextMenu',
		'contextmenu .selection' : 'onContextMenu',
		mousedown : 'onMouseDown'
	},

	initialize: function(){
		this.$el.selectable({
			filter: '.timeline-clip'
		});

		this.$contextMenu = $('<ul/>')
			.prop('class', 'context-menu')
			.append('<li data-cmd="duplicate"><a><span class="ui-icon ui-icon-copy"></span>Duplicate</a></li>')
			.append('<li data-cmd="delete"><a><span class="ui-icon ui-icon-close"></span>Delete</a></li>')
			.menu({
				select: this.onMenuSelect
			})
			.appendTo(document.body);
			
		var remix = this.model.get('remix');

		this.listenTo(remix, 'change:timelineIds', this.onTimelineIdsChange);
		this.listenTo(remix.get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
	},

	onMenuSelect : function(event, ui){
	
		this.$contextMenu.removeClass('show');
		
		switch (ui.item.attr('data-cmd')){
			case 'duplicate':
				this.$el.children('.timeline').each(function(){
					$(this).data('view').duplicateSelection();
				});
				this.shiftSelectionRight();
			break;
			
			case 'delete':
				this.$el.children('.timeline').each(function(){
					$(this).data('view').deleteSelection();
				});
			break;
			
		}
	},
	
	shiftSelectionRight: function(){
		var remix = this.model.get('remix');

		var curSelection = remix.get('selection');
		curSelection.offset.left += curSelection.width;

		remix.trigger('change:selection', remix, curSelection);
	},
	
	onMouseDown: function(){
		this.$contextMenu.removeClass('show');
	},
	
	onSelecting: function(event, ui){
		$(ui.selecting).data('view').model.set('selected', true);
	},
	
	onSelected: function(event, ui){
		$(ui.selected).data('view').model.set('selected', true);
	},
	
	onUnselecting: function(event, ui){
		$(ui.unselecting).data('view').model.set('selected', false);
	},
	
	onUnselected: function(event, ui){
		$(ui.unselected).data('view').model.set('selected', false);
	},
	
	onSelectStart: function(){
		_.defer(this.afterSelectStart);
	},
	
	afterSelectStart: function(){
		this.$helper = $.single('body > .ui-selectable-helper');
		this.updateSelection(true);
	},
	
	/* TODO :: make more efficient! */
	updateSelection: function(repeat){
		this.model.get('remix').set('selection', {
			offset: this.$helper.offset(),
			width: this.$helper.width(),
			height: this.$helper.height()
		});
		if (repeat){
			this.updateSelectionTimeoutID = _.delay(this.updateSelection, 50, true);
		}
	},

	onSelectStop: function(event, ui){
		this.updateSelection();
		clearTimeout(this.updateSelectionTimeoutID);
	},

	onContextMenu: function(event){
		event.stopPropagation();
		event.preventDefault();
		
		this.$contextMenu.css({
			left: event.pageX,
			top: event.pageY
		}).addClass('show');
	},

	onTimelinesSortUpdate: function(event, ui){
		this.model.get('remix').set('timelineIds',
			this.$el.children('.timeline').map(function(){
				return $(this).data('view').model.id;
			}).get()
		);
	},


	onTimelineIdsChange: function(remix, timelineIds){
		var $timelines = this.$el.children('.timeline');

		$timelines.each(function(){
			var $this = $(this);

			var order = _.indexOf(timelineIds, $this.data('view').model.id);

			$timelines.each(function(){
				if (order < _.indexOf(timelineIds, $(this).data('view').model.id)){
					$this.insertBefore(this);
					return false;
				}
			});

		});

	},

	onTimelinesAdd: function(timeline){
		this.listenTo(timeline, 'change:' + timeline.idAttribute, this.onTimelinesSortUpdate);

		var view = new WebRemixer.Views.Timeline({
			model: timeline
		});

		var timelineIds = timeline.get('remix').get('timelineIds');

		var order = _.indexOf(timelineIds, timeline.id);

		if (order !== -1){
			//insert timeline in the correct position
			this.$el.children('.timeline').each(function(){
				if (order < _.indexOf(timelineIds, $(this).data('view').model.id)){
					view.$el.insertBefore(this);
					return false;
				}
			});
		}

		//if not inserted, insert the timeline
		if (!view.$el.parent().length){
			this.$el.append(view.el);
		}
	},
	
	onTimelinesRemove: function(timeline){
		this.stopListening(timeline);

		this.$el.single('#' + timeline.cid).data('view').remove();
	}

});