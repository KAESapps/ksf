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
			this._value = this._computer.computeValue(changeArg, this._value);
			this._emit('value', this._value);
			// console.time('emit changes on Stateful');
			this._emit('changes', changeArg);
			// console.timeEnd('emit changes on Stateful');
		},
		_onChanges: function(cb) {
			return this._on('changes', cb);
		},

		_onValue: function(cb) {
			return this._on('value', cb);
		},
		_withValue: function(cb) {
			cb(this._getValue());
			return this._on('value', cb);
		},
		// TODO: à mettre dans un autre mixin
/*		_withChanges: function(cb) {
			cb(this._computer.getChangesFromValue(this._value));
			return this._on('changes', cb);
		},
*/	});

	return Stateful;
});