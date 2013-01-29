WebRemixer.Views.MainMenu = Backbone.View.extend({
  className: 'main-menu',
  
  events: {
   
  },
  
  initialize: function(){
    _.bindAll(this);
    this.$menuBar = $('<ul/>').appendTo(this.el);
    this.$fileMenu = $('<ul/>').appendTo($('<li><button>File</button></li>').appendTo(this.$menuBar)).append(
      '<li><a href="#Open...">Open...</a></li>'
    );
    this.$editMenu = $('<ul/>').appendTo($('<li><button>Edit</button></li>').appendTo(this.$menuBar)).append(
      '<li><a href="#">Delete</a></li>',
      '<li><a href="#">Duplicate</a></li>'
    );
    this.$menuBar.menubar({
      autoExpand: true,
			buttons: true
    });
  },

  render: function(){
    
  }
  
});