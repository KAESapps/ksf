define([
	'compose',
], function(
	compose
){
	var ValueAPI = {
		value: function(value) {
			if (arguments.length) {
				return this._change(value);
			} else {
				return this._getValue();
			}
		},
		onChange: function(cb) {
			return this._onChange(cb);
		},
	};
	ValueAPI.change = ValueAPI.value;

	var Value = compose(function() {
		this.ctr = compose(ValueAPI);
	});
	return Value;
});