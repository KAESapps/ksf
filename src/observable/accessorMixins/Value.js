define([
	'compose',
], function(
	compose
){
	var ValueAPI = {
		value: function(value) {
			if (arguments.length) {
				this._change(value);
			} else {
				return this._getValue();
			}
		},
		onChange: function(cb) {
			return this._onChange(cb);
		},
	};

	var Value = compose(function() {
		this.ctr = compose(ValueAPI);
	});
	return Value;
});