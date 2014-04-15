define([
	'compose',
	'./BasicPropertyObject',
], function(
	compose,
	BasicPropertyObject
){
	var PropertyObject = compose(BasicPropertyObject, {
		computeValue: function(changeArg, initValue) {
			if (changeArg === undefined) {
				return undefined;
			} else {
				var value = (initValue === undefined) ? {} : initValue;
				var properties = this._properties;
				Object.keys(changeArg).forEach(function(key) {
					var property = properties[key];
					value[key] = property.computeValue(changeArg[key], (initValue === undefined) ? undefined : initValue[key]);
				});
				return value;
			}
		},
		computeChangeArgFromValue: function(newValue, initValue) {
			if (initValue === undefined) {
				return newValue;
			}
		},
	});
	return PropertyObject;
});