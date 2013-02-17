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
        primary: 'ui-icon-plus'
      },
      label: 'New Clip',
      text: false
    }).appendTo(this.el);
      
    this.$clips = $('<div/>').addClass('clips').appendTo(this.el);
  
    this.listenTo(this.model, 'change:open', this.onVisibilityChange);  
    this.listenTo(this.model.get('remix').get('clips'), {
      add: this.onClipsAdd,
      remove: this.onClipsRemove
    });
    
    this.model.trigger('change:open');
  
    this.render();
  },
  
  onVisibilityChange: function(){
    if (this.model.get('open')){
      this.$el.addClass('open');
    }else{
      this.$el.removeClass('open');
    }
  },
  
  createNewClip: function(){
    var clip =
      new WebRemixer.Models.Clip({
        remix: this.model.get('remix')
      });

    clip.save();

    this.inspect( clip );
  },

 onClipsAdd: function(model){
    var view = new WebRemixer.Views.Clip({
      model: model
    });

    //insert clip in the correct position
    this.$clips.children('.clip').each(function(){
      if ($(this).data('view').model.get('order') > model.get('order')){
        view.$el.insertBefore(this);
        return false;
      }
    });

    //if not inserted, insert the clip
    if (!view.$el.parent().length){
      this.$clips.append(view.el);
    }
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