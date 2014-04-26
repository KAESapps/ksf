define([
	'compose',
], function(
	compose
){
	var ValueAPI = {
		value: function() {
			return this._getValue();
		},
	};

	var Value = compose(function() {
		this.ctr = compose(ValueAPI);
	});
	return Value;
});