define([
	'compose',
	'./IncrementalPropertyObject',
], function(
	compose,
	IncrementalPropertyObject
){
	var PropertyObject = compose(IncrementalPropertyObject, {
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
		computeChangeArg: function(changeArg, initValue) {
			if (changeArg === undefined) {
				return undefined;
			}
			if (initValue === undefined) {
				initValue = {};
			}
			return IncrementalPropertyObject.prototype.computeChangeArg.call(this, changeArg, initValue);
		},
	});
	return PropertyObject;
});