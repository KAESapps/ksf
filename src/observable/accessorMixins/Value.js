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
		onValue: function(cb) {
			var self = this;
			return this._onChanges(function() {
				cb(self._getValue());
			});
		},
	};

	var Value = compose(function() {
		this.ctr = compose(ValueAPI);
	});
	return Value;
});