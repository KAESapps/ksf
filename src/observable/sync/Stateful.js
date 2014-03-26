define([
	'compose',
	'ksf/base/Evented',
], function(
	compose,
	Evented
){
	var generator = function(args) {
		var getValue = args.getValue || '_getValue',
			setValue = args.setValue || '_setValue';


		var Stateful = compose(Evented, function(initialValue) {
			this._value = initialValue;
		});
		Stateful.prototype[getValue] = function() {
			return this._value;
		};
		Stateful.prototype[setValue] = function(value) {
			this._value = value;
			this._emit('value', value);
		};
		Stateful.prototype.value = function(value) {
			if (arguments.length === 0) {
				return this._getValue();
			} else {
				this._setValue(value);
			}
		};
		return Stateful;
	};

	var Stateful = generator({});
	Stateful.custom = generator;
	return Stateful;
});