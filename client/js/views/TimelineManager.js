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
		sortupdate : 'onTimelinesSortUpdate'
	},

	initialize: function(){
		this.onTimelinesSortUpdate = _.wrap(this.onTimelinesSortUpdate, _.defer);

		this.$el.sortable({
			tolerance: 'pointer',
			handle: '.header'
		});

		this.$el.selectable({
			filter: '.timeline-clip'
		});

		this.$contextMenu = $('<ul/>')
			.prop('className', 'context-menu')
			.append('<li data-cmd="duplicate"><a><span class="ui-icon ui-icon-copy"></span>Duplicate</a></li>')
			.append('<li data-cmd="delete"><a><span class="ui-icon ui-icon-close"></span>Delete</a></li>')
			.menu({
				select: this.onMenuSelect
			})
			.appendTo(document.body);

		this.$modalOverlay = $('<div/>').prop('className', 'modal-overlay').appendTo(document.body);
			
		var remix = this.model.get('remix');

		this.listenTo(remix, 'change:timelineIds', this.onTimelineIdsChange);
		this.listenTo(remix.get('timelines'), {
			add: this.onTimelinesAdd,
			remove: this.onTimelinesRemove
		});
	},

	onMenuSelect : function(event, ui){
		this.$modalOverlay.removeClass('show');
		this.$contextMenu.removeClass('show');


		var action = ui.item.attr('data-cmd');

		this.model.get('remix').trigger(action);

		if (action === 'duplicate'){
			this.shiftSelectionRight();
		}
	},
	
	shiftSelectionRight: function(){
		var remix = this.model.get('remix');

		var curSelection = remix.get('selection');

		if (!curSelection.offset) return;

		curSelection.offset.left += curSelection.width;

		remix.trigger('change:selection', remix, curSelection);
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
		setTimeout(this.afterSelectStart, 0);
	},
	
	afterSelectStart: function(){
		this.$helper = $.single('body > .ui-selectable-helper');
		this.updateSelectionInterval = setInterval(this.updateSelection, 0);
	},
	
	updateSelection: function(repeat){
		if (!this.$helper) return;

		var remix = this.model.get('remix');
		var selection = remix.get('selection');

		selection.offset = this.$helper.offset();
		selection.width = this.$helper.width();
		selection.height = this.$helper.height();
		remix.trigger('change:selection', remix, selection);
	},

	onSelectStop: function(event, ui){
		this.updateSelection();
		clearInterval(this.updateSelectionInterval);
		this.updateSelectionInterval = undefined;
	},

	onContextMenu: function(event){
		
		this.$contextMenu.css({
			left: event.pageX,
			top: event.pageY
		}).addClass('show');
		this.$modalOverlay.addClass('show');

		WebRemixer.Util.$body.one('mousedown', this.onMouseDown);

		return false;
	},

	onMouseDown: function(event){
		if (this.$contextMenu[0] === event.target || $.contains(this.$contextMenu[0], event.target)){
			return;
		}

		this.$contextMenu.removeClass('show');
		this.$modalOverlay.removeClass('show');

		return false;
	},

	onTimelinesSortUpdate: function(timeline){
		this.model.get('remix').set('timelineIds',
			this.$el.children('.timeline').map(function(){
				return $(this).data('view').model.id;
			}).get()
		);
	},


	onTimelineIdsChange: function(remix, timelineIds){

		var $el = this.$el;

		$el.children('.timeline').each(function(){
			var $this = $(this);

			var order = $this.data('view').model.get('order');

			$el.children('.timeline').each(function(){
				if (order < $(this).data('view').model.get('order')){
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

		var order = timeline.get('order');

		if (order >= 0){
			//insert timeline in the correct position
			this.$el.children('.timeline').each(function(){
				if (order < $(this).data('view').model.get('order')){
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