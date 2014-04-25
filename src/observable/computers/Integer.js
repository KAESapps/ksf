define([
	'compose',
], function(
	compose
){
	var Integer = compose({
		initValue: function(initArg) {
			return initArg && parseInt(initArg, 10);
		},
		computeValue: function(changeArg, initValue) {
			return changeArg;
		},
		computeChangeArg: function(changeArg) {
			return parseInt(changeArg, 10);
		},
	});
	return Integer;
});