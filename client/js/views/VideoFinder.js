WebRemixer.Views.VideoFinder = Backbone.View.extend({
  className: 'video-finder',
    
  events: {
    'dialogopen' : 'onOpen',
    'dialogclose' : 'onClose',
    'change .search': 'onSearchChange',
    'click .video': 'onVideoClick'
  },
  
  initialize: function(){
    _.bindAll(this);
    $(this.onLoad);
    
    this.$search = $('<input class="search" type="text"/>').appendTo(
      $('<div data-label="Search"/>').appendTo(this.el)
    );
    this.$searchResults = $('<div class="search-results"/>').appendTo(this.el);
    
    
    this.listenTo(this.model, 'change:open', this.onVisibilityChange);
    
    this.render();
  },
  
  onOpen: function(){
    this.model.set('open', true);
  },
  
  onClose: function(){
    this.model.set('open', false);
  },
  
  onVisibilityChange: function(){
    if (this.model.get('open')){
      this.$el.dialog('open');
    }else{
      this.$el.dialog('close');
    }
  },
  
  onVideoClick: function(event){
    this.model.set('video', $(event.currentTarget).data('view').model);
  },
  
  onSearchChange: function(){
    if (this.xhr){
      this.xhr.abort();
    }
    this.$searchResults.empty();
    this.xhr = $.get('http://gdata.youtube.com/feeds/api/videos', {
      v: 2.1,
      alt: 'jsonc',
      q: this.$search.val()
    }, this.onSearchLoad); 
  },
  
  onSearchLoad: function(res){
    this.$searchResults.empty();
    var items = res.data.items;
    for (var i = 0; i < items.length; ++i){
      var data = items[i];
      this.$searchResults.append(
        new WebRemixer.Views.Video({
          model: new WebRemixer.Models.Video({
            title: data.title,
            duration: data.duration,
            thumbnail: data.thumbnail.hqDefault
          })
        }).el
      );
    }
  },
    
  onLoad: function(){
    this.$el.appendTo(document.body).dialog({
      title: 'Find Video',
      autoOpen: false,
      modal: true,
      width: 960,
      height: 600
    });
  },
  
  render: function(){
    
  }
});