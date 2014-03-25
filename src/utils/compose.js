define([

], function(

){
	var compose = function(base) {
		var constructors = [];
		var prototypes = [];
		var trait;
		var i, props;

		for (i = 0 ; i < arguments.length ; i++) {
			trait = arguments[i];
			if (typeof trait === 'function') {
				constructors.push(trait);
				prototypes.push(trait.prototype);
			} else {
				prototypes.push(trait);
			}
		}
		var constructorsLenght = constructors.length;

		var Ctr = function() {
			for (i = 0 ; i < constructorsLenght ; i++) {
				constructors[i].apply(this, arguments);
			}
		};
		Ctr.prototype = Object.create((typeof base === 'function') ? base.prototype : base);
		// don't mix base properties as they are inherited
		for (i = 1 ; i < prototypes.length ; i++) {
			props = prototypes[i];
			for (var key in props) {
				Ctr.prototype[key] = props[key];
			}
		}
		return Ctr;
	};
	return compose;
});