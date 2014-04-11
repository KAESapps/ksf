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
		_change: function(changeArg) {
			this._value = this._computer.computeValue(changeArg, this._value);
			this._emit('value', this._value);
			this._emit('changes', changeArg);
		},
		onValue: function(cb) {
			return this._on('value', cb);
		},
		onChanges: function(cb) {
			return this._on('changes', cb);
		},
		withValue: function(cb) {
			cb(this._getValue());
			return this._on('value', cb);
		},
		// TODO: à mettre dans un autre mixin
/*		withChanges: function(cb) {
			cb(this._computer.getChangesFromValue(this._value));
			return this._on('changes', cb);
		},
*/	});

	return Stateful;
});