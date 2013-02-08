$(function(){
  new WebRemixer.Routers.Remix();
  Backbone.history.start({pushState: true});
});