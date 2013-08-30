define([

], function(

){
	var destroy = function(value){
		if (! value) {return;}
		if (value.destroy) {
			value.destroy();
		} else if (typeof value === "function") {
			value();
		} else if (value.forEach){
			// if it is an iterable without 'destroy' method, try to destroy each of its elements
			value.forEach(destroy);
		}
	};
	return destroy;
});