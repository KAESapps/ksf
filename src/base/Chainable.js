define([

], function(

){
	var Chainable = {
		chain: function() {
			this[arguments[0]].apply(this, Array.prototype.slice.call(arguments, 1));
			return this;
		}
	};
	return Chainable;
});