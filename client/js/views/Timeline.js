WebRemixer.Views.Timeline = WebRemixer.View.extend({
	className: 'timeline',
	
	events: {
		'click .toggle-height' : 'onToggleHeightClick',
		'drop .timeline-clips' : 'onDrop',
		'change .automation-selector': 'onAutomationSelectorChange'
	},

	initialize: function(){

		this.$header = $('<div/>')
			.prop('className', 'header')
			.appendTo(this.el);

		this.$automationSelector = $('<select/>').prop('className', 'automation-selector').append(
			$('<option/>').val('').text('-')
		);

		for (var i = WebRemixer.Automations.length; i--;){
			var automationName = WebRemixer.Automations[i];
			$('<option/>').val(automationName).text(automationName.charAt(0).toUpperCase() + automationName.slice(1))
				.appendTo(this.$automationSelector);
		}

		this.$automationSelector.appendTo(this.$header);

		this.$automationValue = $('<div/>').prop('className', 'automation-value').slider({
			orientation: 'vertical',
			range: 'min',
			disabled: true,
			min: 0,
			max: 100
		}).appendTo(this.$header);
			
		this.$toggleHeight = $('<button/>').prop('className', 'toggle-height')
			.button({
				icons: {
					primary: 'ui-icon-circle-triangle-s'
				},
				label: 'Collapse',
				text: false
			}).appendTo(this.$header);

		this.$timelineClips = $('<div/>').prop('className', 'timeline-clips').droppable({
			accept: '.clip, .timeline-clip',
			tolerance: 'pointer',
			hoverClass: 'ui-state-highlight'
		}).appendTo(this.el);

		this.automationData = new WebRemixer.Views.AutomationData({
			model: this.model.get('automationData'),
			$timelineClips: this.$timelineClips
		});
		this.$timelineClips.append(this.automationData.el);
			
		$('<div/>').prop('className', 'selection').appendTo(this.el);
		
		this.listenTo(this.model, {
			'change:collapsed': this.onCollapsedChange,
			'change:remix': this.onRemixChange,
			'change:order': this.onOrderChange,
			'change:selectedAutomation': this.onSelectedAutomationChange
		});
		this.listenTo(this.model.get('timelineClips'), {
			add: this.onTimelineClipsAdd,
			remove: this.onTimelineClipsRemove
		});

		this.onOrderChange(this.model, this.model.get('order'));
		this.onRemixChange(this.model, this.model.get('remix'));
		this.onSelectedAutomationChange(this.model, this.model.get('selectedAutomation'));
		this.onAutomationSelectorChange();
		this.onCollapsedChange(this.model, this.model.get('collapsed'));

		WebRemixer.Util.$window.scroll(this.onScroll);
	},

	onSelectedAutomationChange: function(timeline, selectedAutomation){
		this.$automationSelector.val(selectedAutomation);
	},

	onAutomationSelectorChange: function(){
		var selectedAutomation = this.$automationSelector.val();
		if (selectedAutomation){
			this.$automationValue.removeClass('hidden');
		}else{
			this.$automationValue.addClass('hidden');
		}
		this.model.set('selectedAutomation', selectedAutomation);
	},

	onScroll: function(){
		this.$header.css('transform', 'translate3d(0,' + (-WebRemixer.Util.$window.scrollTop()) + 'px,0)');
	},
	
	onOrderChange: function(timeline, order){
		this.$header.attr(
			'data-title', 'Timeline ' + (order + 1)
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
				'change:playTime': this.onPlayTimeChange,
				'duplicate': this.duplicateSelection,
				'delete': this.deleteSelection
			});
		}
	},

	onPlayTimeChange: function(remix, playTime){
		var selectedAutomation = this.model.get('selectedAutomation');
		if (selectedAutomation){
			this.$automationValue.slider('option', 'value', this.model.get('automation')[selectedAutomation]);
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
		var selection = this.model.get('selection');

		var $selectedClips = this.getSelectedClips();
		
		$selectedClips.each(function(){
			var timelineClip = $(this).data('view').model;
			var clone = timelineClip.clone();
			clone.set('startTime', clone.get('startTime') + selection.duration);
			if (timelineClip.get('selected')){
				timelineClip.set('selected', false);
			}
		});

		for (var i = WebRemixer.Automations.length; i--;){
			this.duplicateAutomation(WebRemixer.Automations[i], selection.startTime, selection.duration);
		}
	},

	duplicateAutomation: function(automationName, startTime, duration){
		var points = this.model.get(automationName);
		
		var endTime = startTime + duration;

		var lookupPoint = [startTime];
		var i = _.sortedIndex(points, lookupPoint, '0');

		lookupPoint[0] += duration;
		var endingIdx = _.sortedIndex(points, lookupPoint, '0');

		lookupPoint[0] += duration;
		var dupeEndingIdx = _.sortedIndex(points, lookupPoint, '0');

		var spliceArgs = [endingIdx, dupeEndingIdx - endingIdx];
		while (i < endingIdx){
			var point = points[i];
			spliceArgs.push([point[0] + duration, point[1]]);
			++i;
		}

		if (spliceArgs.length > 2){
			Array.prototype.splice.apply(points, spliceArgs);
			this.model.trigger('change change:' + automationName, this.model, points);
		}
	},
	
	deleteSelection: function(){
		var $selectedClips = this.getSelectedClips();
		if (!$selectedClips) return;
		
		$selectedClips.each(function(){
			$(this).data('view').del();
		});
	},
	
	getSelectedClips: function(){
		return this.$timelineClips.find('.timeline-clip.ui-selected');
	},
	
	onSelectionChange: function(remix, selection){
	
		var offset = this.$el.offset();
		var height = this.$el.height();
		
		var $selection = this.$el.single('.selection');

		//make sure selection is at least 1x1 and check for the 3 types of intersections
		if (selection.width >= 1 && selection.height >= 1 &&
				((selection.offset.top >= offset.top && selection.offset.top <= offset.top + height) ||
				(selection.offset.top + selection.height >= offset.top && selection.offset.top + selection.height <= offset.top + height) ||
				(selection.offset.top <= offset.top && selection.offset.top + selection.height >= offset.top + height))) {
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