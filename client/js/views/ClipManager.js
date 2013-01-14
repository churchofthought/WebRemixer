WebRemixer.Views.ClipManager = Backbone.View.extend({
  className: 'clip-manager',
    
  events: {
    'click .clip .inspect': 'inspect',
    'click .clip' : 'inspect',
    'click .new-clip' : 'createNewClip'
  },
  
  initialize: function(){
  
    _.bindAll(this);
    
    this.$newClip = $('<button class="new-clip"/>').button({
      icons: {
        primary: 'ui-icon-plus',
      },
      label: 'New Clip',
      text: false
    }).appendTo(this.el);
      
    this.$clips = $('<div/>').addClass('clips').appendTo(this.el);
  
  
    this.listenTo(this.model.get('remix').get('clips'), {
      add: this.onClipsAdd,
      remove: this.onClipsRemove
    });
  
    this.render();
  },
  
  createNewClip: function(){
    var clip = new WebRemixer.Models.Clip({

    });
    
    this.model.get('remix').get('clips').add(clip);
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