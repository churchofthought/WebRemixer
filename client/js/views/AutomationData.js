WebRemixer.Views.AutomationData = WebRemixer.View.extend({
	className: 'automation-data',

	initialize: function(options){

		this.$timelineClips = options.$timelineClips;

		// we need to be appended to dom to get the pointMinY and pointRangeY
		setTimeout(this.init, 0);
	},

	init: function(){
		var height = this.$timelineClips.height();

		this.pointMinY = height * 0.8;
		this.pointRangeY = height * 0.6;

		this.$svg = document.createSVGElement('svg');

		var $defs = document.createSVGElement('defs');
		$defs.appendChild(this.createGridPattern());


		this.$pointPath = document.createSVGElement('path');
		this.$pointPath.className.baseVal = 'pointPath';

		this.$svg.appendChild($defs);
		this.$svg.appendChild(this.createBackground());
		this.$svg.appendChild(this.$pointPath);
		this.$el.append(this.$svg);

		this.$tooltip = $('<div/>').prop('className', 'tooltip').appendTo(this.el);

		var timeline = this.model.get('timeline');

		this.listenTo(timeline, 'change:selectedAutomation', this.onSelectedAutomationChange);

		this.onSelectedAutomationChange(timeline, timeline.get('selectedAutomation'));
	},

	createGridPattern: function(){
		var $pattern = document.createSVGElement('pattern');

		$pattern.id = 'automation-grid';
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

	createBackground: function(){
		var $bg = document.createSVGElement('rect');
		$bg.className.baseVal = 'bg';
		$bg.setAttribute('y', '20%');
		$bg.setAttribute('width', '100%');
		$bg.setAttribute('height', '60%');

		return $bg;
	},

	pointFromEvent: function(event){
		var offs = this.$el.offset();
		return [Math.max(0, event.pageX - offs.left), Math.max(this.pointMinY - this.pointRangeY, Math.min(this.pointMinY, event.pageY - offs.top))];
	},

	onMouseDown: function(event){
		this.mousedownPoint = this.pointFromEvent(event);
		if (event.target.className.baseVal === 'point'){
			event.stopPropagation();
			this.$draggedPoint = event.target;
		}else{
			this.$draggedPoint = undefined;
		}

		this.$timelineClips.unbind('mousemove.automationData');
		WebRemixer.Util.$body.bind({
			'mousemove.automationData': this.onMouseMove,
			'mouseup.automationData': this.onMouseUp
		});
	},

	onMouseMove: function(event){
		var mousePoint = this.pointFromEvent(event);

		var timeline = this.model.get('timeline');

		var realPoint =  [
			Math.max(0, Math.min(timeline.get('remix').get('duration'), mousePoint[0] / WebRemixer.PX_PER_SEC)),
			Math.max(0, Math.min(100, 100 * ((this.pointMinY - mousePoint[1]) / this.pointRangeY)))
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
			this.$draggedPoint.setAttribute('cy', mousePoint[1]);

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

	onMouseUp: function(event){
		if (this.mousedownPoint){
			if (this.$draggedPoint){
				this.onMouseMove(event);
			}else{
				var point = this.pointFromEvent(event);
				if (_.isEqual(this.mousedownPoint, point)){
					point[0] /= WebRemixer.PX_PER_SEC;
					point[1] = 100 * ((this.pointMinY - point[1]) / this.pointRangeY);
					this.addPoint(point);
				}
			}
		}

		this.mousedownPoint = undefined;
		this.$draggedPoint = undefined;



		var timeline = this.model.get('timeline');
		var points = timeline.get(timeline.get('selectedAutomation'));

		this.render(points);

		timeline.trigger('change');

		WebRemixer.Util.$body.unbind('.automationData');
		this.$timelineClips.bind('mousemove.automationData', this.onMouseMove);
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
		$point.setAttribute('cy', this.pointMinY - this.pointRangeY * point[1] / 100 );
		$point.setAttribute('r', '.35em');

		$point.idx = idx;

		this.$svg.appendChild($point);
	},

	pointToCoordStr: function(point){
		var coordStr = (point[0] * WebRemixer.PX_PER_SEC);
		coordStr += ',';
		coordStr += (this.pointMinY - this.pointRangeY * point[1] / 100);

		return coordStr;
	},

	drawPath: function(points){
		var path = 'M';
		path += this.pointToCoordStr([this.model.get('timeline').get('remix').get('duration'), 100]);
		for (var i = points.length; i--;){
			path += 'L';
			path += this.pointToCoordStr(points[i]);
		}
		path += 'L';
		path += this.pointToCoordStr([0,100]);
		this.$pointPath.setAttribute('d', path);
	},

	onAutomationPointsChange: function(timeline, automationPoints){
		this.render(automationPoints);
	},

	onSelectedAutomationChange: function(timeline, selectedAutomation){
		this.stopListening(timeline, 'change:' + timeline.previous('selectedAutomation'));
		this.listenTo(timeline, 'change:' + selectedAutomation, this.onAutomationPointsChange);

		this.$timelineClips.unbind('.automationData');

		if (selectedAutomation){
			this.$timelineClips.bind({
				'mousedown.automationData' : this.onMouseDown,
				'mousemove.automationData' : this.onMouseMove
			});
		}

		this.render(timeline.get(selectedAutomation));
	},

	render: function(points){
		if (!points){
			this.$el.addClass('hidden');
			return;
		}
		var $points = this.$svg.getElementsByClassName('point');
		for (var i = $points.length; i--;){
			this.$svg.removeChild($points[i]);
		}

		this.$el.removeClass('hidden');

		for (i = points.length; i--;){
			this.drawPoint(points[i], i);
		}

		this.drawPath(points);
	}
});