define([
	'compose',
	'./_Stateful',
	'ksf/base/Evented'
], function(
	compose,
	_Stateful,
	Evented
){
	var proto = {
		_computeValueFromChanges: function(arg) {},
		_applyChanges: function(changes) {
			this._applyValue(this._computeValueFromChanges(this._getValue(), changes));
			this._emit('changes', changes);
			return changes;
		},
		_onChanges: function(listener) {
			return this.on('changes', function(changes) {
				if (changes.length > 0) {
					listener(changes);
				}
			});
		},
		_patch: function(changes) {
			return this._applyChanges(this._computeChangesFromPatch(this._getValue(), changes));
		},
		_set: function(arg) {
			return this._applyChanges(this._computeChangesFromSet(this._getValue(), arg));
		},
	};
	return compose(_Stateful, Evented, proto, {
		patch: proto._patch,
		set: proto._set,
		onChanges: proto._onChanges
	});
});