WebRemixer.Views.TimelineClip = WebRemixer.View.extend({
	className: 'timeline-clip',
	
	events: {
		dragstop: 'onDragStop',
		resizestop: 'onResizeStop',
		'click .toggle-loop': 'toggleLoop',
		'click .duplicate': 'duplicate',
		'click .delete': 'del'
	},
	
	initialize: function(){
		var grid = [WebRemixer.PX_PER_SEC / 8, 1];

		this.$el.draggable({
			containment: '.timelines',
			stack: '.' + this.className,
			snap: '.timeline',
//      snapTolerance: WebRemixer.PX_PER_SEC / 16,
			grid: grid,
			helper: this.getDraggableHelper
		}).resizable({
			//containment: 'parent',
			handles: 'e,w',
			grid: grid
		}).css(
			'position', 'absolute'
		);
		//set position to absolute, fix for draggable
		
		/*var menu = $(
			'<ul class="timeline-clip-menu">' +
			'<li><a href="#">Item 1</a></li>' +
			'<li><a href="#">Item 2</a></li>' +
			'</ul>'
		).menu();*/
		
		this.$loopIndicator = $('<div/>').prop('className', 'loop-indicator').appendTo(this.el);
		
		var $buttons = $('<div/>').prop('className', 'buttons');
		
		var loopId = Math.random().toString(36);
		var $loopLabel = $('<label/>').attr('for', loopId).appendTo($buttons);

		$buttons.append(
		
			$('<input type="checkbox"/>').prop({
					id: loopId,
					class: 'toggle-loop'
				}).appendTo($buttons).button({
				icons: {
					primary: 'ui-icon-refresh'
				},
				label: 'Loop',
				text: false
			}),
			
			$('<button/>').prop('className', 'duplicate').button({
				icons: {
					primary: 'ui-icon-copy'
				},
				label: 'Duplicate',
				text: false
			}),
			
			$('<button/>').prop('className', 'delete').button({
				icons: {
					primary: 'ui-icon-close'
				},
				label: 'Delete',
				text: false
			})
			
		).appendTo(this.el);
		
		
		
		this.listenTo(this.model, {
							 change : this.render,
		'change:timeline' : this.onTimelineChange,
		'change:selected' : this.onSelectedChange
		});

		this.render();

		this.onSelectedChange(this.model, this.model.get('selected'));
	},
	
	onSelectedChange: function(timelineClip, selected){
		if (selected){
			this.$el.addClass('ui-selected');
		}else{
			this.$el.removeClass('ui-selected');
		}
	},
	
	getDraggableHelper: function(){
		this.origDraggableParent = this.$el.parent();
		
		var offset = this.$el.offset();
		
		return this.$el.appendTo(this.$el.closest('.timelines')).offset(offset);
	},
	
	onDragStop: function(){
		if (this.origDraggableParent){
			if (!this.$el.parent('.timeline-clips').length){
				this.$el.appendTo(this.origDraggableParent);
			}
			this.model.set('startTime', (this.$el.position().left - this.origDraggableParent.offset().left) / WebRemixer.PX_PER_SEC);
			this.origDraggableParent = undefined;
		}
	},
	
	onResizeStop: function(){
		this.model.set({
			startTime: this.$el.position().left / WebRemixer.PX_PER_SEC,
			duration: this.$el.width() / WebRemixer.PX_PER_SEC
		});
	},
	
	toggleLoop: function(){
		this.model.set('loop', !this.model.get('loop'));
	},
	
	duplicate: function(timeDelta){
		var selected = this.model.get('selected');
	
		var clone = new WebRemixer.Models.TimelineClip({
			timeline: this.model.get('timeline'),
			clip: this.model.get('clip'),
			startTime: this.model.get('startTime') + (typeof timeDelta === 'number' && timeDelta || this.model.get('duration')),
			duration: this.model.get('duration'),
			loop: this.model.get('loop'),
			selected: selected
		});

		if (selected){
			this.model.set('selected', false);
		}   
	},
	
	del: function(){
		this.model.destroy();
	},
	
	onTimelineChange: function(){
		this.onDragStop();
		this.render();
	},

	render: function(){
		var clip = this.model.get('clip');
		var video = clip.get('video');
		
		this.$loopIndicator.css({
			'background-size': WebRemixer.EMS_PER_SEC * (this.model.get('loop') ? 
				clip.get('cutDuration') :  
				video.get('duration')
				) + 'em' + ' 100%'
		});
		
		this.$el.css({
			background: 'url("' + video.get('thumbnail') + '")',
			left: WebRemixer.EMS_PER_SEC * this.model.get('startTime') + 'em',
			width: WebRemixer.EMS_PER_SEC * this.model.get('duration') + 'em'
		}).attr({
			'data-title': clip.get('title')
		});
	}
	
});