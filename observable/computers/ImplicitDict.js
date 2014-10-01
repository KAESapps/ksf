define([
	'../../utils/compose',
], function(
	compose
){
	/**
	Version de Dict avec un format de change simplifié, où les clés sont créées si elles n'existent pas et supprimées si leur valeur est undefined
	*/
	var Dict = compose({
		initValue: function(initArg) {
			return initArg || {};
		},
		computeValue: function(changeArg, initValue) {
			var self = this;
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var changeAtKey = changeArg[key];
				// setting a key to undefined is the convention to remove the key, all other values create the key if needed
				// there cannot be nested observable mutable values
				if (changeAtKey === undefined) {
					delete value[key];
				} else {
					value[key] = changeAtKey;
				}
			});
			return value;
		},
	});
	return Dict;



});

