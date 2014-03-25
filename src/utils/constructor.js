define([
	'./mixinProperties'
], function(
	mixin
) {
	var constructor = function(base, Constructor, proto) {
		switch (typeof base){
			case "function":
				switch (typeof Constructor){
					case "function":
						var originalPrototype = Constructor.prototype;
						Constructor.prototype = Object.create(base.prototype);
						mixin(Constructor.prototype, originalPrototype);
						break;
					case "object":
						proto = Constructor;
						Constructor = base;
						break;
					default:
						Constructor = base;
				}
				break;
			case "object": // only a prototype is provided
				Constructor = function(){};
				proto = base;
				break;
			default:
				throw "Invalid arguments";
		}
		proto && mixin(Constructor.prototype, proto);
		// optional
		Constructor.extends = function(ctr, proto){
			return constructor(Constructor, ctr, proto);
		};
		return Constructor;
	};
	return constructor;
});