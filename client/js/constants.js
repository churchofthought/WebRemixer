WebRemixer.preloadDelay = .5;
WebRemixer.EMS_PER_SEC = 8;
$(function(){
	WebRemixer.PX_PER_SEC = WebRemixer.EMS_PER_SEC * parseFloat($(document.body).css('fontSize'));
});


// model save delay
WebRemixer.Config.saveOnChangeDelay = 500;

// models
WebRemixer.Models.idAttribute = '_id';