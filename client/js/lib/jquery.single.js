(function(){
	// keep qsl function as a closure with context variable "selector"
	// faster to set the variable "selector", than creating a closure everytime
	var selector;
	function qsl(){
		return this.querySelector(selector);
	}

	// extend jQuery
	// if qsl is available, use it
	// otherwise just use jQuery.find
	jQuery.fn.extend({
		single: document.querySelector ? 
			function(s){
				selector = s;
				return this.map(qsl);
			} 
		:
			function(s){
				return this.find(s);
			}
	}); 

})();



(function(){
	
	// also allow for jQuery.single, use document as base node
	// use qsl if available, otherwise use jQuery(selector)
	jQuery.single = 
	document.querySelector ? 
		function(selector){
			return this(document.querySelector(selector));
		} 
	: 
		function(selector){
			return this(selector);
		};
})();