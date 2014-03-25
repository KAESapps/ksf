define([
	'compose',
	'ksf/base/Evented',
], function(
	compose,
	Evented
){
	var generator = function(args) {
		var getValue = args.getValue || 'getValue',
			setValue = args.setValue || 'setValue';


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
		return Stateful;
	};

	var Stateful = generator({});
	Stateful.custom = generator;
	return Stateful;
});