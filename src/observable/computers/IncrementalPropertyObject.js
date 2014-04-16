define([
	'compose',
], function(
	compose
){
	var PropertyObject = compose(function(properties) {
		this._properties = properties;
	}, {
		computeValue: function(changeArg, initValue) {
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var property = this._properties[key];
				value[key] = property.computeValue(changeArg[key], initValue[key]);
			}.bind(this));
			return value;
		},
		computeChangeArg: function(changeArg, initValue) {
			var outChangeArg = {};
			Object.keys(changeArg).forEach(function(key) {
				var property = this._properties[key];
				outChangeArg[key] = property.computeChangeArg(changeArg[key], initValue[key]);
			}.bind(this));
			return outChangeArg;
		},
	});
	return PropertyObject;
});