define([
	'compose',
	'./IncrementalPropertyObject',
], function(
	compose,
	IncrementalPropertyObject
){
	var PropertyObject = compose(IncrementalPropertyObject, {
		initValue: function(initArg) {
			if (!initArg) {
				return undefined;
			}
			return IncrementalPropertyObject.prototype.initValue.call(this, initArg);
		},
		computeValue: function(changeArg, initValue) {
			if (changeArg === undefined) {
				return undefined;
			}
			// si la valeur précédente était "undefined", on initialise une nouvelle valeur en utilisant le changeArg comme un initArg, est-ce une mauvaise idée ?
			if (initValue === undefined) {
				return this.initValue(changeArg);
			}
			return IncrementalPropertyObject.prototype.computeValue.call(this, changeArg, initValue);
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