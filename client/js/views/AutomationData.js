WebRemixer.Views.AutomationData = WebRemixer.View.extend({
	className: 'automation-data',

	initialize: function(options){

		this.$timelineClips = options.$timelineClips;

		// we need to be appended to dom to get the pointMinY and pointRangeY
		setTimeout(this.init, 0);
	},

	init: function(){

		this.pointMinY = 81; 
		this.pointRangeY = 61;

		this.$svg = document.createSVGElement('svg');

		var $defs = document.createSVGElement('defs');
		var $pattern = this.createGridPattern();
		$defs.appendChild($pattern);


		this.$pointPath = document.createSVGElement('path');
		this.$pointPath.className.baseVal = 'pointPath';

		this.$svg.appendChild($defs);
		this.$svg.appendChild(this.createBackground($pattern));
		this.$svg.appendChild(this.$pointPath);
		this.$el.append(this.$svg);

		this.$tooltip = $('<div/>').prop('className', 'tooltip').appendTo(this.el);

		var timeline = this.model.get('timeline');

		this.listenTo(timeline, {
			'change:selectedAutomation': this.onSelectedAutomationChange,
			'change:collapsed': _.bind(setTimeout, window, this.onTimelineCollapsedChange, 250)
		});

		this.onTimelineCollapsedChange();
		this.onSelectedAutomationChange(timeline, timeline.get('selectedAutomation'));
	},

	onTimelineCollapsedChange: function(){
		this.height = this.$timelineClips.height();
		this.pointRangeYAbs = this.height * this.pointRangeY / 100;
		this.pointMinYAbs = this.height * this.pointMinY / 100;
	},

	createGridPattern: function(){
		var $pattern = document.createSVGElement('pattern');

		$pattern.id = Math.random().toString(36);
		$pattern.setAttribute('patternUnits', 'userSpaceOnUse');
		$pattern.setAttribute('width', '1em');
		$pattern.setAttribute('height', '1em');

		var $rect = document.createSVGElement('rect');
		$rect.className.baseVal = 'vertical-rule';
		$rect.setAttribute('width', 1);
		$rect.setAttribute('height', '100%');
		$pattern.appendChild($rect);

		$rect = document.createSVGElement('rect');
		$rect.className.baseVal = 'horizontal-rule';
		$rect.setAttribute('width', '100%');
		$rect.setAttribute('height', 1);
		$pattern.appendChild($rect);

		return $pattern;
	},

	createBackground: function($pattern){
		var $bg = document.createSVGElement('rect');
		$bg.className.baseVal = 'bg';
		$bg.setAttribute('y', (this.pointMinY - this.pointRangeY) + '%');
		$bg.setAttribute('width', '100%');
		$bg.setAttribute('height', this.pointRangeY + '%');
		$bg.setAttribute('fill', 'url("#' + $pattern.id + '")');

		return $bg;
	},

	pointFromEvent: function(event){
		var offs = this.$el.offset();
		return [Math.max(0, event.pageX - offs.left), Math.max(this.pointMinYAbs - this.pointRangeYAbs, Math.min(this.pointMinYAbs, event.pageY - offs.top))];
	},

	onMouseDown: function(event){
		this.originalClickTarget = event.target;

		if (event.which !== 1){
			return;
		}

		var shouldBubble = true;

		this.mousedownPoint = this.pointFromEvent(event);
		if (event.target.className.baseVal === 'point'){
			shouldBubble = false;
			this.$draggedPoint = event.target;
		}else{
			this.$draggedPoint = undefined;
		}

		this.$timelineClips.unbind('mousemove.automationData');
		WebRemixer.Util.$body.bind({
			'mousemove.automationData': this.onMouseMove,
			'mouseup.automationData': this.onMouseUp
		});

		return shouldBubble;
	},

	onMouseMove: function(event){
		var mousePoint = this.pointFromEvent(event);

		var timeline = this.model.get('timeline');

		var realPoint =  [
			Math.max(0, Math.min(timeline.get('remix').get('duration'), mousePoint[0] / WebRemixer.PX_PER_SEC)),
			Math.max(0, Math.min(100, 100 * ((this.pointMinYAbs - mousePoint[1]) / this.pointRangeYAbs)))
		];

		this.$tooltip.css({
			left: mousePoint[0],
			top: mousePoint[1]
		}).text('(' +
			(Math.floor(100 * realPoint[0]) / 100) + ',' +
			(Math.floor(100 * realPoint[1]) / 100) +
		')');

		if (this.$draggedPoint){
			var points = timeline.get(timeline.get('selectedAutomation'));

			this.$draggedPoint.setAttribute('cx', mousePoint[0]);
			this.$draggedPoint.setAttribute('cy', (this.pointMinY - this.pointRangeY * realPoint[1] / 100 ) + '%');

			var draggedPoint = points[this.$draggedPoint.idx];

			var curIndex = _.sortedIndex(points, draggedPoint, '0');

			var newIndex = _.sortedIndex(points, realPoint, '0');

			draggedPoint[0] = realPoint[0];
			draggedPoint[1] = realPoint[1];

			var diff = newIndex - curIndex;

			if (diff && diff !== 1){
				if (diff > 1) --newIndex;
				points.splice(newIndex, 0, points.splice(curIndex, 1)[0]);
				this.$draggedPoint.idx = newIndex;
			}

			this.drawPath(points);
		}
	},

	onClick: function(event){
		console.log('click motha fucka');

		if (this.mousedownPoint){
			if (this.$draggedPoint){
				this.onMouseMove(event);
			}else{
				var point = this.pointFromEvent(event);
				if (_.isEqual(this.mousedownPoint, point)){
					point[0] /= WebRemixer.PX_PER_SEC;
					point[1] = 100 * ((this.pointMinYAbs - point[1]) / this.pointRangeYAbs);
					this.addPoint(point);
				}
			}
		}

		this.mousedownPoint = undefined;
		this.$draggedPoint = undefined;



		

		WebRemixer.Util.$body.unbind('.automationData');
		this.$timelineClips.bind('mousemove.automationData', this.onMouseMove);

		var timeline = this.model.get('timeline');
		var selectedAutomation = timeline.get('selectedAutomation');
		timeline.trigger('change change:' + selectedAutomation, timeline, timeline.get(selectedAutomation));
	},

	onMouseUp: function(event){
		// don't duplicate event, click already handled the same element
		if (event.target !== this.originalClickTarget){
			this.onClick(event);
		}
	},



	addPoint: function(point){
		var timeline = this.model.get('timeline');
		var points = timeline.get(timeline.get('selectedAutomation'));

		var idx = _.sortedIndex(points, point, '0');

		points.splice(idx, 0, point);

		this.render(points);
	},

	drawPoint: function(point, idx){
		var $point = document.createSVGElement('circle');
		$point.className.baseVal = 'point';
		$point.setAttribute('cx', point[0] * WebRemixer.PX_PER_SEC);
		$point.setAttribute('cy', (this.pointMinY - this.pointRangeY * point[1] / 100 ) + '%' );
		$point.setAttribute('r', '.35em');

		$point.idx = idx;

		this.$svg.appendChild($point);
	},

	appendLine: function(pointA, pointB){
		var $line = document.createSVGElement('line');
		$line.className.baseVal = 'connector';
		$line.setAttribute('x1', pointA[0] * WebRemixer.PX_PER_SEC);
		$line.setAttribute('x2', pointB[0] * WebRemixer.PX_PER_SEC);
		$line.setAttribute('y1', (this.pointMinY - this.pointRangeY * pointA[1] / 100 ) + '%');
		$line.setAttribute('y2', (this.pointMinY - this.pointRangeY * pointB[1] / 100 ) + '%');
		this.$svg.appendChild($line);
	},

	// TODO, CONVERT SVG PATH INTO A SERIES OF LINES
	drawPath: function(points){
		var $lines = this.$svg.getElementsByClassName('connector');
		for (var i = $lines.length; i--;){
			this.$svg.removeChild($lines[i]);
		}

		var startPoint = [0,100];
		var endPoint = [this.model.get('timeline').get('remix').get('duration'), 100];

		// clever way to always have a line from start-to-end
		// and start-to-1stpoint-...-nthpoint-to-end
		var i = points.length - 1;
		do {
			this.appendLine(points[i] || startPoint, points[i+1] || endPoint);
		} while (i-- !== -1);
	},

	onAutomationPointsChange: function(timeline, automationPoints){
		this.render(automationPoints);
	},

	onSelectedAutomationChange: function(timeline, selectedAutomation){
		this.stopListening(timeline, 'change:' + timeline.previous('selectedAutomation'));
		this.listenTo(timeline, 'change:' + selectedAutomation, this.onAutomationPointsChange);

		this.$timelineClips.unbind('.automationData');

		if (selectedAutomation){
			this.$el.removeClass('hidden');
			this.$timelineClips.bind({
				'mousedown.automationData' : this.onMouseDown,
				'mousemove.automationData' : this.onMouseMove,
				'click.automationData': this.onClick
			});
			this.render(timeline.get(selectedAutomation));
		}else{
			this.$el.addClass('hidden');
		}
	},

	render: function(points){
		var $points = this.$svg.getElementsByClassName('point');
		for (var i = $points.length; i--;){
			this.$svg.removeChild($points[i]);
		}

		for (i = points.length; i--;){
			this.drawPoint(points[i], i);
		}

		this.drawPath(points);
	}
});