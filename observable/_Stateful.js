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
		},
		_set: function(arg) {
			return this._applyValue(this._computeValueFromSet(arg, this._getValue()));
		}
	};
	return compose(function(initialValue) {
		this._observableState = new StateContainer();
		this._set(initialValue);
	}, proto, {
		get: proto._getValue,
		_computeValueFromSet: function(arg, initValue) { return arg; },
		set: proto._set,
		onValue: proto._onValue
	});
});