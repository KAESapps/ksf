define([
	'compose',
], function(
	compose
){
	var Value = compose(function(value) {
		this._value = value;
	}, {
		initValue: function(initValue) {
			return this._value;
		},
	});
	return Value;
});