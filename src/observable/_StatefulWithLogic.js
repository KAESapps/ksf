define([
	'compose',
	'../base/Evented',
], function(
	compose,
	Evented
){

	var Stateful = compose(Evented, {
		_getValue: function() {
			return this._value;
		},
		_change: function(changeArg) {
			changeArg = this._computer.computeChangeArg(changeArg, this._value);
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