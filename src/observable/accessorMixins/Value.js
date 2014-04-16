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
			var self = this;
			return this._onChange(function(value) {
				cb(value);
			});
		},
	};

	var Value = compose(function() {
		this.ctr = compose(ValueAPI);
	});
	return Value;
});