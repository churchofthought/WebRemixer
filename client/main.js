(function(){

  var remixer = new WebRemixer.Views.Remixer({
    model: new WebRemixer.Models.Remixer({})
  });
  
  $(function(){
    remixer.$el.appendTo(document.body);
  });
  
})();