WebRemixer.Views.AutomationData = WebRemixer.View.extend({
	className: 'automation-data',

	events: {
		mousedown: 'onMouseDown',
		mousemove: 'onMouseMove',
		mouseup: 'onMouseUp'
	},

	initialize: function(){
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

		this.listenTo(this.model, 'change:points', this.onPointsChange);
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
		if (event.target.className.baseVal == 'point'){
			this.$draggingPoint = event.target;
			event.stopPropagation();
			event.preventDefault();
		}
	},

	onMouseMove: function(event){
		var mousePoint = this.pointFromEvent(event);

		var height = this.$el.height();

		this.$tooltip.css({
			left: mousePoint[0],
			top: mousePoint[1]
		}).text('(' +
			(Math.floor(100 * mousePoint[0] / WebRemixer.PX_PER_SEC)/ 100) + ',' +
			(Math.floor(10000 * (height - mousePoint[1]) / height) / 100) +
		')');

		if (this.$draggingPoint){
			event.stopPropagation();
			event.preventDefault();

			this.$draggingPoint.setAttribute('cx', mousePoint[0]);
			this.$draggingPoint.setAttribute('cy', mousePoint[1]);


			var points = this.model.get('points');

			var draggedPoint = this.$draggingPoint.point;

			var curIndex = _.sortedIndex(points, draggedPoint, function(p){
				return p[0];
			});

			var newIndex = _.sortedIndex(points, mousePoint, function(p){
				return p[0];
			});

			draggedPoint[0] = mousePoint[0];
			draggedPoint[1] = mousePoint[1];

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
				this.addPoint(point);
			}
		}

		this.mousedownPoint = undefined;
		this.$draggingPoint = undefined;
	},

	addPoint: function(point){
		var points = this.model.get('points');

		points.splice(_.sortedIndex(points, point, function(p){
			return p[0];
		}), 0, point);

		this.drawPoint(point);
		this.drawPath(points);
	},

	drawPoint: function(point){
		var $point = document.createSVGElement('circle');
		$point.className.baseVal = 'point';
		$point.setAttribute('cx', point[0]);
		$point.setAttribute('cy', point[1]);
		$point.setAttribute('r', '.3em');

		point.$point = $point;
		$point.point = point;

		this.$svg.appendChild($point);
	},

	drawPath: function(points){
		this.$pointPath.setAttribute('d', 'M' + points.join('L'));
	},

	onPointsChange: function(automationData, points){



	}
});