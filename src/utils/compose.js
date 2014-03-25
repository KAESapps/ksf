define([

], function(

){
	var compose = function(base) {
		var traits = Array.prototype.slice.call(arguments);
		var ctr = function() {
			var instance = this;
			var args = arguments;
			traits.forEach(function(trait) {
				typeof trait === 'function' && trait.apply(instance, args);
			});
			return instance;
		};
		ctr.prototype = Object.create((typeof base === 'function') ? base.prototype : base);
		// don't mix base properties as they are inherited
		traits.slice(1).forEach(function(trait, index) {
			var props = (typeof trait === 'function') ? trait.prototype : trait;
			Object.keys(props).forEach(function(key) {
				ctr.prototype[key] = props[key];
			});
		});
		return ctr;
	};
	return compose;
});