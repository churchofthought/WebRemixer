WebRemixer.Views.ClipManager = Backbone.View.extend({
  className: 'clip-manager',
    
  events: {
    'click .clip .inspect' : 'onInspectClick',
             'click .clip' : 'onInspectClick',
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
    
    this.inspect(clip);
  },
  
  onClipsAdd: function(model){
    this.$clips.append(
      new WebRemixer.Views.Clip({
        model: model
      }).el
    );
  },
  
  onClipsRemove: function(model){
    this.$clips.single('#' + model.cid).data('view').remove();
  },
  
  onInspectClick: function(event){
    this.inspect($(event.currentTarget).closest('.clip').data('view').model);
  },
  
  inspect: function(clip){
    this.model.get('remix').get('clipInspector').set({
      open: true,
      clip: clip
    });
  },
  
  render: function(){
    
  }
});