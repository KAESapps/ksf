define([
	'compose',
	'../../base/Evented',
], function(
	compose,
	Evented
){

	var Stateful = compose(Evented, {
		_getValue: function() {
			return this._value;
		},
		_setValue: function(value) {
			this._value = value;
			this._emit('value', value);
		},
		value: function(value) {
			if (arguments.length === 0) {
				return this._value;
			} else {
				this._setValue(value);
			}
		},
		onValue: function(cb) {
			return this._on('value', cb);
		},
		withValue: function(cb) {
			cb(this._getValue());
			return this._on('value', cb);
		},
	});

	return Stateful;
});