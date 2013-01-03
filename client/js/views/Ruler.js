WebRemixer.Views.Ruler = Backbone.View.extend({
  className: 'ruler',
  
  initialize: function() {
    _.bindAll(this);
  
    this.$markings = $('<div/>').addClass('markings').appendTo(this.el);
    this.$timeHand = $('<div/>').addClass('timeHand').appendTo(this.el);
  
    this.listenTo(this.model.get('remix'), {
      'change:duration' : this.render,
      'change:playTime' : this.onPlaytimeChange
    });
    this.onPlaytimeChange();
    this.render();
  },
  
  onPlaytimeChange: function(){
    this.$timeHand.css({
      left: WebRemixer.EMS_PER_SEC * this.model.get('remix').get('playTime') + 'em'
    });
  },
  
  render: function() {
    this.$markings.empty();
    for (var i = 0, duration = this.model.get('remix').get('duration'); i <= duration; ++i){
      this.$markings.append($('<div/>').text(i || '|').append('<div/>'));
    }
  }
});