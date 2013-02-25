WebRemixer.Views.AutomationData = WebRemixer.View.extend({
	className: 'automation-data',
	
	events: {
		mousedown: 'onMouseDown',
		mousemove: 'onMouseMove',
		mouseup: 'onMouseUp'
	},

	initialize: function(){
		this.$svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.$pointPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		this.$pointPath.className.baseVal = 'pointPath';
		
		this.$svg.appendChild(this.$pointPath);
		this.$el.append(this.$svg);

		this.listenTo(this.model, 'change:points', this.onPointsChange);
	},

	pointFromEvent: function(event){
		var offs = this.$el.offset();
		return [event.pageX - offs.left, event.pageY - offs.top];
	},

	onMouseDown: function(event){
		if (event.target.className.baseVal == 'point'){
			this.$draggingPoint = event.target;
		}
	},

	onMouseMove: function(event){
		var mousePoint = this.pointFromEvent(event);

		if (this.$draggingPoint){
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
		if (!this.$draggingPoint){
			this.addPoint(this.pointFromEvent(event));
		}

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
		var $point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
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