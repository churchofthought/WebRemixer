WebRemixer.Views.Clip = WebRemixer.View.extend({
	
	className: 'clip',
	
	events: {
		  dragstart     : 'onDragStart',
		'click .delete' : 'onDeleteClick'
	},
	
	initialize: function(){
		/*this.$el
			.draggable({
				snap: '.timeline',
				grid: [WebRemixer.PX_PER_SEC / 8, 1],
				helper: 'clone',
				appendTo: document.body
			});*/
			
		$('<div/>').prop('class', 'buttons').append(
			$('<button/>').prop('class', 'inspect').button({
				icons: {
					primary: 'ui-icon-pencil'
				},
				label: 'Inspect',
				text: false
			}),
			$('<button/>').prop('class', 'delete').button({
				icons: {
					primary: 'ui-icon-close'
				},
				label: 'Delete',
				text: false
			})
		).appendTo(this.el);
			
		this.listenTo(this.model, 'change', this.render);
		
		this.render();
	},

	onDeleteClick: function(){
		this.model.destroy();
	},
	
	onDragStart: function(){
		if (!this.model.get('video')){
			return false;
		}
	},
	
	render: function(){
		var video = this.model.get('video');
		
		if (video){
			this.$el.css('background-image', 'url("' + video.get('thumbnail') + '")');
		}
		
		this.$el.attr({
			'data-title': this.model.get('title'),
			'data-duration': this.model.get('cutDuration') + 's'
		});
	}
});