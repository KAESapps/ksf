define([
	'compose',
], function(
	compose
){
	var Integer = compose({
		computeValue: function(changeArg, initValue) {
			return changeArg;
		},
		computeChangeArg: function(changeArg) {
			return parseInt(changeArg, 10);
		},
	});
	return Integer;
});