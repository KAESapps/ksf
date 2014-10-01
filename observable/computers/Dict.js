define([
	'../../utils/compose',
], function(
	compose
){
	var Dict = compose({
		initValue: function(initArg) {
			return initArg || {};
		},
		computeValue: function(changeArg, initValue) {
			var value = initValue;
			Object.keys(changeArg).forEach(function(key) {
				var changeAtKey = changeArg[key];
				if ('value' in changeAtKey) {
					value[key] = changeAtKey.value;
				}
				if (changeAtKey.remove) {
					delete value[key];
				}
				if ('add' in changeAtKey) {
					value[key] = changeAtKey.add;
				}
			});
			return value;
		},
	});
	return Dict;



});

