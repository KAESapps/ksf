define([
	'compose',
], function(
	compose
){
	var Value = compose({
		computeValue: function(changeArg, initValue) {
			return changeArg;
		},
	});
	return Value;
});