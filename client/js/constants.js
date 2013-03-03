WebRemixer.EMS_PER_SEC = 8;
$(function(){
	WebRemixer.PX_PER_SEC = WebRemixer.EMS_PER_SEC * parseFloat($(document.body).css('fontSize'));
});

// models
WebRemixer.Models.idAttribute = '_id';


// -- configurable constants -- //
// model save delay
WebRemixer.Config.saveOnChangeDelay = 500;
WebRemixer.Config.preloadDelay = .5;