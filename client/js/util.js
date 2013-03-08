// give every view access to common elements and window width / height
WebRemixer.Util.$window = $(window);
WebRemixer.Util.$html = $(document.documentElement);

WebRemixer.Util.$window.resize(function(){
	WebRemixer.Util.winWidth = WebRemixer.Util.$window.width();
	WebRemixer.Util.winHeight = WebRemixer.Util.$window.height();
}).trigger('resize');

$(function(){
	WebRemixer.Util.$body = $(document.body);
	WebRemixer.PX_PER_SEC = WebRemixer.EMS_PER_SEC * parseFloat(WebRemixer.Util.$body.css('fontSize'));
});

HTMLDocument.prototype.createSVGElement = _.partial(HTMLDocument.prototype.createElementNS, 'http://www.w3.org/2000/svg');