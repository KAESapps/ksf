define([
	'compose',
	'./IncrementalPropertyObject',
], function(
	compose,
	IncrementalPropertyObject
){
	var PropertyObject = compose(IncrementalPropertyObject, {
		initValue: function(initArg) {
			// par défaut on initialise la valeur à un objet plutôt qu'à undefined
			if (! arguments.length) {
				initArg = {};
			}
			// il faut explicitement un initArg à undefined pour que la valeur initiale soit undefined
			// if (initArg === undefined) {
			// 	return undefined;
			// }
			return IncrementalPropertyObject.prototype.initValue.call(this, initArg);
		},
		computeValue: function(changeArg, initValue) {
			if (changeArg === undefined) {
				return undefined;
			}
			// si la valeur précédente était "undefined", on initialise une nouvelle valeur
			if (initValue === undefined) {
				initValue = this.initValue({});
			}
			return IncrementalPropertyObject.prototype.computeValue.call(this, changeArg, initValue);
		},
		computeChangeArg: function(changeArg, initValue) {
			if (changeArg === undefined) {
				return undefined;
			}
			if (initValue === undefined) {
				initValue = this.initValue({});
			}
			return IncrementalPropertyObject.prototype.computeChangeArg.call(this, changeArg, initValue);
		},
	});
	return PropertyObject;
});