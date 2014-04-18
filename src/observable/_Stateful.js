define([
	'compose',
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
			// console.time('emit changes on Stateful');
			this._emit('change', changeArg);
			// console.timeEnd('emit changes on Stateful');
		},
		_onChange: function(cb) {
			return this._on('change', cb);
		},

	});

	return Stateful;
});