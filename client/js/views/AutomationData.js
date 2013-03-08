WebRemixer.Views.AutomationData = WebRemixer.View.extend({
	className: 'automation-data',

	initialize: function(options){

		this.$timelineClips = options.$timelineClips;

		// we need to be appended to dom to get the pointMinY and pointRangeY
		setTimeout(this.init, 0);
	},

	init: function(){
		this.pointMinY = this.$timelineClips.height();
		this.pointRangeY = this.pointMinY * 0.8;

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

		this.listenTo(timeline, 'change:selectedAutomationPoints', this.onPointsChange);

		this.onPointsChange(timeline, timeline.get('selectedAutomationPoints'));
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
		$bg.setAttribute('width', '100%');
		$bg.setAttribute('height', '100%');

		return $bg;
	},

	pointFromEvent: function(event){
		var offs = this.$el.offset();
		return [event.pageX - offs.left, event.pageY - offs.top];
	},

	onMouseDown: function(event){
		this.mousedownPoint = this.pointFromEvent(event);
		if (event.target.className.baseVal === 'point'){
			this.$draggingPoint = event.target;
			event.stopPropagation();
			event.preventDefault();
		}
	},

	onMouseMove: function(event){
		var mousePoint = this.pointFromEvent(event);
		var realPoint =  [
			mousePoint[0] / WebRemixer.PX_PER_SEC,
			100 * ((this.pointMinY - mousePoint[1]) / this.pointRangeY)
		];

		this.$tooltip.css({
			left: mousePoint[0],
			top: mousePoint[1]
		}).text('(' +
			(Math.floor(100 * realPoint[0]) / 100) + ',' +
			(Math.floor(100 * realPoint[1]) / 100) +
		')');

		if (this.$draggingPoint){
			var points = this.model.get('timeline').get('selectedAutomationPoints');

			this.$draggingPoint.setAttribute('cx', mousePoint[0]);
			this.$draggingPoint.setAttribute('cy', mousePoint[1]);

			var draggedPoint = this.$draggingPoint.point;

			var curIndex = _.sortedIndex(points, draggedPoint, 0);

			var newIndex = _.sortedIndex(points, realPoint, 0);

			draggedPoint[0] = realPoint[0];
			draggedPoint[1] = realPoint[1];

			var diff = newIndex - curIndex;

			if (diff > 1){
				points.splice(newIndex - 1, 0, points.splice(curIndex, 1)[0]);
			}else if (diff < 0){
				points.splice(newIndex, 0, points.splice(curIndex, 1)[0]);
			}

			this.drawPath(points);
		}
	},

	onMouseUp: function(event){
		if (this.mousedownPoint && !this.$draggingPoint){
			var point = this.pointFromEvent(event);
			if (_.isEqual(this.mousedownPoint, point)){
				point[0] /= WebRemixer.PX_PER_SEC;
				point[1] = 100 * ((this.pointMinY - point[1]) / this.pointRangeY)
				this.addPoint(point);
			}
		}

		// TODO this shouldn't fire change all the time
		this.firePointsChange();

		this.mousedownPoint = undefined;
		this.$draggingPoint = undefined;
	},

	addPoint: function(point){
		var points = this.model.get('timeline').get('selectedAutomationPoints');

		points.splice(_.sortedIndex(points, point, 0), 0, point);

		this.drawPoint(point);
		this.drawPath(points);
	},

	drawPoint: function(point){
		var $point = document.createSVGElement('circle');
		$point.className.baseVal = 'point';
		$point.setAttribute('cx', point[0] * WebRemixer.PX_PER_SEC);
		$point.setAttribute('cy', this.pointMinY - this.pointRangeY * point[1] / 100 );
		$point.setAttribute('r', '.35em');

		point.$point = $point;
		$point.point = point;

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
		path += this.pointToCoordStr(this.model.get('timeline').get('automationEndPoint'));
		for (var i = points.length; i--;){
			path += 'L';
			path += this.pointToCoordStr(points[i]);
		}
		path += 'L';
		path += this.pointToCoordStr([0,100]);
		this.$pointPath.setAttribute('d', path);
	},

	firePointsChange: function(){
		var timeline = this.model.get('timeline');
		var selectedAutomation = timeline.get('selectedAutomation') + 'Automation';
		timeline.trigger('change change:' + selectedAutomation, timeline, timeline.get('selectedAutomationPoints'));
	},

	onPointsChange: function(timeline, points){
		this.$timelineClips.unbind('.automationData');

		if (!points){
			this.$el.addClass('hidden');
			return;
		}
		var $points = this.$svg.getElementsByClassName('point');
		for (var i = $points.length; i--;){
			this.$svg.removeChild($points[i]);
		}

		this.$el.removeClass('hidden');

		this.$timelineClips.bind({
			'mousedown.automationData': this.onMouseDown,
			'mousemove.automationData': this.onMouseMove,
			'mouseup.automationData': this.onMouseUp
		});

		for (i = points.length; i--;){
			this.drawPoint(points[i]);
		}
		this.drawPath(points);
	}
});