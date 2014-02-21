define([
	'compose',
	'./StateContainer'
], function(
	compose,
	StateContainer
){
	return compose(function(initialValue) {
		this._observableState = new StateContainer();
		this.setValue(initialValue);
	}, {
		_readValue: function() {
			return this._observableState.get();
		},
		_writeValue: function(value) {
			this._observableState.set(value);
			return value;
		},

		getValue: function() {
			return this._readValue();
		},
		computeValueFromSet: function(arg, initValue) { return arg; },
		setValue: function(arg) {
			return this._writeValue(this.computeValueFromSet(arg, this.getValue()));
		},
		onValue: function(listener) {
			return this._observableState.onValue(listener);
		},
	});
});