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
		_setValue: function(value) {
			this._observableState.set(value);
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
		_computeValueFromSet: function(arg) { return arg; },
		set: function(arg) {
			this._setValue(this._computeValueFromSet(arg));
		},
		onValue: proto._onValue
	});
});