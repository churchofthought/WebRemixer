WebRemixer.Models.Remix = Backbone.Model.extend({
  defaults: {
    duration: 200
  },
  
  initialize: function(){
  
    var opts = {
      remix: this
    };
    
    this.set({
       playControls: new WebRemixer.Models.PlayControls(opts),
              ruler: new WebRemixer.Models.Ruler(opts),
        clipManager: new WebRemixer.Models.ClipManager(opts),
      clipInspector: new WebRemixer.Models.ClipInspector(opts)
    });
  }
});