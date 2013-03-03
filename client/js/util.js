// give every view access to common elements and window width / height
WebRemixer.Util.$window = $(window);
WebRemixer.Util.$html = $(document.documentElement);

WebRemixer.Util.$window.resize(function(){
	WebRemixer.Util.winWidth = WebRemixer.Util.$window.width();
	WebRemixer.Util.winHeight = WebRemixer.Util.$window.height();
}).trigger('resize');

$(function(){
	WebRemixer.Util.$body = $(document.body);
});