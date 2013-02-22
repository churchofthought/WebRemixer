WebRemixer.Views.Timeline = WebRemixer.View.extend({
	className: 'timeline',
	
	events: {
		'click .toggle-height' : 'onToggleHeightClick',
		'drop .timeline-clips' : 'onDrop'
	},

	initialize: function(){
			
		this.$header = $('<div/>')
			.prop('class', 'header')
			.appendTo(this.el);
			
		this.$toggleHeight = $('<button/>').prop('class', 'toggle-height')
			.button({
				icons: {
					primary: 'ui-icon-circle-triangle-s'
				},
				label: 'Collapse',
				text: false
			}).appendTo(this.$header);
			
		this.$timelineClips = $('<div/>').prop('class', 'timeline-clips').droppable({
			accept: '.clip, .timeline-clip',
			tolerance: 'pointer',
			hoverClass: 'ui-state-highlight'
		}).appendTo(this.el);
			
		$('<div/>').prop('class', 'selection').appendTo(this.el);
		
		this.listenTo(this.model, {
			'change:collapsed': this.onCollapsedChange,
			'change:remix': this.onRemixChange
		});
		this.listenTo(this.model.get('timelineClips'), {
			add: this.onTimelineClipsAdd,
			remove: this.onTimelineClipsRemove
		});

		this.onRemixChange(this.model, this.model.get('remix'));

		this.$window.scroll(this.onScroll);
	},

	onScroll: function(){
		this.$header.css('transform', 'translate3d(0,' + (-this.$window.scrollTop()) + 'px,0)');
	},
	
	onTimelineIdsChange: function(remix, timelineIds){
		this.$header.attr(
			'data-title', 'Timeline ' + (_.indexOf(timelineIds, this.model.id) + 1)
		);
	},
	
	onRemixChange: function(timeline, remix){
		var prevRemix = this.model.previous('remix');
		if (prevRemix){
			this.stopListening(prevRemix);
		}
		
		if (remix){
			this.listenTo(remix, {
				'change:selection': this.onSelectionChange,
				'change:timelineIds': this.onTimelineIdsChange
			});
		}
	},
	
	onTimelineClipsAdd: function(timelineClip){
		var $timelineClip = $.single('#' + timelineClip.cid);

		if (!$timelineClip.length){
			$timelineClip = new WebRemixer.Views.TimelineClip({
				model: timelineClip
			}).el;
		}

		this.$timelineClips.append($timelineClip);
	},
	
	onTimelineClipsRemove: function(timelineClip){
		if (!timelineClip.get('timeline')){
			var view = this.$timelineClips.single('#' + timelineClip.cid).data('view');
			if (view){
				view.remove();
			}
		}
	},

	onToggleHeightClick: function(){
		this.model.set('collapsed', !this.model.get('collapsed'));
	},
	
	onCollapsedChange: function(timeline, collapsed){
		if (collapsed){
			this.$el.addClass('collapsed');
			this.$toggleHeight.button('option', {
					label: 'Expand',
					icons: {
						primary: 'ui-icon-circle-triangle-n'
					}
			});
		}else{
			this.$el.removeClass('collapsed');
			this.$toggleHeight.button('option', {
				label: 'Collapse',
				icons: {
					primary: 'ui-icon-circle-triangle-s'
				}
			});
		}
	},
	
	duplicateSelection: function(){
		var $selectedClips = this.getSelectedClips();
		if (!$selectedClips) return;
		
		var duration = this.model.get('selection').duration;
		
		$selectedClips.each(function(){
			$(this).data('view').duplicate(duration);
		})
		
	},
	
	deleteSelection: function(){
		var $selectedClips = this.getSelectedClips();
		if (!$selectedClips) return;
		
		$selectedClips.each(function(){
			$(this).data('view').del();
		});
	},
	
	getSelectedClips: function(){
		var selection = this.model.get('selection');
		if (!selection) return;
		
		var $selectedClips = this.$timelineClips.find('.timeline-clip.ui-selected');

		return $selectedClips.size() && $selectedClips;
	},
	
	onSelectionChange: function(remix, selection){
	
		var offset = this.$el.offset();
		var height = this.$el.height();
		
		var $selection = this.$el.single('.selection');

		//make sure selection is at least 1x1 and check for the 3 types of intersections
		if (selection.width >= 1 && selection.height >= 1 &&
				((selection.offset.top >= offset.top && selection.offset.top <= offset.top + height)
				|| (selection.offset.top + selection.height >= offset.top && selection.offset.top + selection.height <= offset.top + height)
				|| (selection.offset.top <= offset.top && selection.offset.top + selection.height >= offset.top + height))) {
			$selection.css({
				left: selection.offset.left,
				width: selection.width
			});
			this.model.set('selection', {
				startTime: (selection.offset.left - this.$timelineClips.offset().left) / WebRemixer.PX_PER_SEC,
				duration: selection.width / WebRemixer.PX_PER_SEC
			});
		}else{
			$selection.css(
				'width', 0
			);
			this.model.set('selection', {
				startTime: 0,
				duration: 0
			});
		}
	},
	
	onDrop: function(event, ui){
		if (ui.draggable.hasClass('over-manager')){
			return;
		}

		var view = ui.draggable.data('view');
		
		if (view instanceof WebRemixer.Views.TimelineClip){
			view.model.set('timeline', this.model);
		}else if (view instanceof WebRemixer.Views.Clip){
			new WebRemixer.Models.TimelineClip({
				timeline: this.model,
				clip: view.model,
				startTime: (ui.offset.left - this.$timelineClips.offset().left) / WebRemixer.PX_PER_SEC,
				loop: true
			}).save();
		}
	}
});