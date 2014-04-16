define([
	'compose',
], function(
	compose
){
	var PropertyObject = compose(function(properties) {
		this._properties = properties;
	}, {
		computeValue: function(changeArg, initValue) {
			return changeArg;
		},
		computeChangeArg: function(changeArg, initValue) {
			var outChangeArg = {};
			var properties = this._properties;
			Object.keys(properties).forEach(function(key) {
				var property = properties[key];
				if (property.computeChangeArg) {
					outChangeArg[key] = property.computeChangeArg(changeArg[key], initValue[key]);
				}
			});
			return outChangeArg;
		},
	});
	return PropertyObject;
});