$(function(){
	WebRemixer.router = new WebRemixer.Routers.Remix();
	Backbone.history.start({pushState: true});
});