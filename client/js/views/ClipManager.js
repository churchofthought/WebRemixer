WebRemixer.Views.ClipManager = Backbone.View.extend({
  className: 'clip-manager',
    
  events: {
    'click .clip .inspect': 'inspect',
    'click .clip' : 'inspect'
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    
    this.$clips = $('<div/>').addClass('clips').appendTo(this.el);
  
  
    this.listenTo(this.model.get('remix').get('clips'), {
      add: this.onClipsAdd,
      remove: this.onClipsRemove
    });
  
    this.render();
  },
  
  onClipsAdd: function(model){
    var clip = new WebRemixer.Views.Clip({
      model: model
    });
    this.$clips.append(clip.el);
  },
  
  onClipsRemove: function(model){
    this.$clips.single('#' + model.cid).data('view').remove();
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