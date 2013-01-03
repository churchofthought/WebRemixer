WebRemixer.Views.Clip = Backbone.View.extend({
  
  className: 'clip',
  
  initialize: function(){
    this.$el
      .data('view', this)
      .draggable({
        snap: '.timeline',
        grid: [WebRemixer.PX_PER_SEC / 8, 1],
        helper: 'clone'
      });
      
    $('<div/>').addClass('buttons').append(
      $('<button class="inspect"/>').button({
        icons: {
          primary: 'ui-icon-pencil',
        },
        label: 'Inspect',
        text: false
      })
    ).appendTo(this.el);
      
    if (this.model.get('remix')){
      this.onRemixChange();
    }
    
    this.listenTo(this.model, 'change:remix', this.onRemixChange);
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },
  
  onRemixChange: function(){
    $.single('.remix[data-id="%s"] > .clip-manager > .clips'
      .sprintf(this.model.get('remix').id))
      .append(this.el);
  },

  render: function(){
    var video = this.model.get('video');
    
    this.$el.css({
      backgroundImage: 'url("%s")'.sprintf(video.get('thumbnail'))
    }).attr({
      'data-title': this.model.get('title'),
      'data-duration': this.model.get('cutDuration') + 's'
    });
  }
});