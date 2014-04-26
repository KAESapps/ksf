define([
	'compose',
], function(
	compose
){
	var Value = compose({
		initValue: function(initValue) {
			return new Date();
		},
	});
	return Value;
});