define([
	'compose',
], function(
	compose
){
	var Dict = compose({
		initValue: function(initArg) {
			return initArg || {};
		},
		computeValue: function(changeArg, initValue) {
			var self = this;
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var changeAtKey = changeArg[key];
				if (changeAtKey.value) {
					value[key] = changeAtKey.value;
				}
				if (changeAtKey.remove) {
					delete value[key];
				}
				if (changeAtKey.add) {
					value[key] = changeAtKey.add;
				}
			});
			return value;
		},
	});
	return Dict;



});

