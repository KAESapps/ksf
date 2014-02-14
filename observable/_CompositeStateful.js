define([
	'compose',
	'./_Stateful'
], function(
	compose,
	_Stateful
){
	var proto = {
		_computeValueFromPatch: function(arg) {},
		_patchValue: function(arg) {
			this._changes = arg;
			this._setValue(this._computeValueFromPatch(this._getValue(), arg));
		},
		_onChanges: function(listener) {
			var self = this;
			return this._observableState.onValue(function(value) {
				listener({
					value: value,
					diff: self._changes
				});
			});
		},
	};
	return compose(_Stateful, proto, {
		patch: proto._patchValue,
		onChanges: proto._onChanges
	});
});