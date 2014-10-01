define([
	'../utils/compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
){

	var Stateful = compose(_Evented, {
		_getValue: function() {
			return this._value;
		},
		_change: function(changeArg) {
			this._value = this._computer.computeValue(changeArg, this._value);
			this._emit('change', changeArg);
		},
		_onChange: function(cb) {
			return this._on('change', cb);
		},

	});

	return Stateful;
});