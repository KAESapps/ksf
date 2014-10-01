define([
	'../../utils/compose',
], function(
	compose
){
	var PropertyObject = compose(function(properties) {
		this._properties = properties;
	}, {
		initValue: function(initArg) {
			var value = {};
			var argumentsLength = arguments.length;
			var properties = this._properties;
			Object.keys(properties).forEach(function(key) {
				var property = properties[key];
				value[key] = argumentsLength ? property.initValue(initArg && initArg[key]) : property.initValue();
			});
			return value;
		},
		computeValue: function(changeArg, initValue) {
			var value = initValue;
			var properties = this._properties;
			Object.keys(changeArg).forEach(function(key) {
				var property = properties[key];
				value[key] = property.computeValue(changeArg[key], initValue[key]);
			});
			return value;
		},
		computeChangeArg: function(changeArg, initValue) {
			var outChangeArg = {};
			var properties = this._properties;
			Object.keys(changeArg).forEach(function(key) {
				var property = properties[key];
				outChangeArg[key] = property.computeChangeArg(changeArg[key], initValue[key]);
			});
			return outChangeArg;
		},
	});
	return PropertyObject;
});