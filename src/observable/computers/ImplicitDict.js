define([
	'compose',
], function(
	compose
){
	var Dict = compose({
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

