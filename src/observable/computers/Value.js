define([
	'compose',
], function(
	compose
){
	var Value = compose({
		initValue: function(initValue) {
			return initValue;
		},
		computeValue: function(changeArg, initValue) {
			return changeArg;
		},
		computeChangeArg: function(changeArg, initValue) {
			return changeArg;
		},
	});
	return Value;
});