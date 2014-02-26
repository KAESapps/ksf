define([
	'compose',
	'./StateContainer'
], function(
	compose,
	StateContainer
){
	var generator = function(args) {
		var GETVALUE = args.getValue || 'getValue',
			SETVALUE = args.setValue || 'setValue',
			ONVALUE = args.onValue || 'onValue';

		var Trait = function(initialValue) {
			this._observableState = new StateContainer();
			this[SETVALUE](initialValue);
		};
		Trait.prototype = {
			_readValue: function() {
				return this._observableState.get();
			},
			_writeValue: function(value) {
				this._observableState.set(value);
				return value;
			},
			computeValueFromSet: function(arg, initValue) { return arg; },
		};
		
		Trait.prototype[GETVALUE] = function() {
			return this._readValue();
		};
		Trait.prototype[SETVALUE] = function(arg) {
			return this._writeValue(this.computeValueFromSet(arg, this[GETVALUE]()));
		};
		Trait.prototype[ONVALUE] = function(listener) {
			return this._observableState.onValue(listener);
		};
		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});