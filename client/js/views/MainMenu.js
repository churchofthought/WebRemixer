WebRemixer.Views.MainMenu = WebRemixer.View.extend({
	className: 'main-menu',
	
	initialize: function(){
		this.$menuBar = $('<ul/>').appendTo(this.el);
		this.$fileMenu = $('<ul/>').appendTo($('<li><button>File</button></li>').appendTo(this.$menuBar)).append(
			'<li><a href="#Open...">Open...</a></li>'
		);
		this.$editMenu = $('<ul/>').appendTo($('<li><button>Edit</button></li>').appendTo(this.$menuBar)).append(
			'<li><a href="#">Delete</a></li>',
			'<li><a href="#">Duplicate</a></li>'
		);
		this.$shareMenu = $('<ul/>').appendTo($('<li><button>Share</button></li>').appendTo(this.$menuBar)).append(
			'<li><a href="#">Delete</a></li>',
			'<li><a href="#">Duplicate</a></li>'
		);
		this.$menuBar.menubar({
			autoExpand: true,
			buttons: true
		});
	}
});