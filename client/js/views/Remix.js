WebRemixer.Views.Remix = WebRemixer.View.extend({
	className: 'remix',
		
	events: {
		'change .title' : 'onTitleInputChange',
		'click .toggle-clip-manager': 'onToggleClipManagerClick'
	},
	


	initialize: function(){
		this.$title = $('<input type="text"/>').prop('className', 'title').attr('placeholder', 'Title Your Remix').appendTo(this.el);
			
		this.mainMenu = new WebRemixer.Views.MainMenu({
			model: this.model.get('mainMenu')
		});
		this.mainMenu.$el.appendTo(this.el);
		
		this.playControls = new WebRemixer.Views.PlayControls({
			model: this.model.get('playControls')
		});
		this.playControls.$el.appendTo(this.el);
		
		this.ruler = new WebRemixer.Views.Ruler({
			model: this.model.get('ruler'),
			$remix: this.el
		});
		this.ruler.$el.appendTo(this.el);

		this.timelineManager = new WebRemixer.Views.TimelineManager({
			model: this.model.get('timelineManager')
		});
		this.timelineManager.$el.appendTo(this.el);
		
		this.clipManager = new WebRemixer.Views.ClipManager({
			model: this.model.get('clipManager')
		});
		this.clipManager.model.set('open', true);
		
		this.clipInspector = new WebRemixer.Views.ClipInspector({
			model: this.model.get('clipInspector')
		});
		
		this.$toggleClipManager = $('<button class="toggle-clip-manager"/>')
			.button({
				icons: {
					primary: 'ui-icon-video'
				},
				label: 'Clip Manager',
				text: false
			}).appendTo(this.el);
		
		this.listenTo(this.model, 'change:title', this.onTitleChange);
		
		this.onTitleChange(this.model, this.model.get('title'));
	},
	
	onTitleInputChange: function(){
		this.model.set('title', this.$title.val());
		
		this.$title.blur();
	},
	
	onTitleChange: function(remix, title){
		this.$title.val(title);
	},
	
	onToggleClipManagerClick: function(){
		var cm = this.model.get('clipManager');
		cm.set('open', !cm.get('open'));
	}
});