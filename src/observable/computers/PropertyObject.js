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
				var propChangeArg = changeArg[key];
				if (propChangeArg.value) {
					value[key] = propChangeArg.value;
				}
				if (propChangeArg.change) {
					var property = this._properties[key];
					value[key] = property.computeValue(propChangeArg.change, initValue[key]);
				}
			}.bind(this));
			return value;
		},
	});
	return PropertyObject;
});