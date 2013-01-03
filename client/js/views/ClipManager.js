WebRemixer.Views.ClipManager = Backbone.View.extend({
  className: 'clip-manager',
    
  events: {
    'click .clip .inspect': 'inspect',
    'click .clip' : 'inspect'
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    
    this.$clips = $('<div/>').addClass('clips').appendTo(this.el);
  
  
    this.render();
  },
  
  inspect: function(event){
    this.model.get('remix').get('clipInspector').set({
      clip: $(event.currentTarget).closest('.clip').data('view').model,
      open: true
    });
  },
  
  render: function(){
    
  }
});