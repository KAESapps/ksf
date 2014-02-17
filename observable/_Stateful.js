define([
	'compose',
	'./StateContainer'
], function(
	compose,
	StateContainer
){
	var proto = {
		_getValue: function() {
			return this._observableState.get();
		},
		_applyValue: function(value) {
			this._observableState.set(value);
			return value;
		},
		_onValue: function(listener) {
			return this._observableState.onValue(listener);
		}
	};
	return compose(function(initialValue) {
		this._observableState = new StateContainer();
		this.set(initialValue);
	}, proto, {
		get: proto._getValue,
		_computeValueFromSet: function(arg, initValue) { return arg; },
		set: function(arg) {
			return this._applyValue(this._computeValueFromSet(arg, this._getValue()));
		},
		onValue: proto._onValue
	});
});