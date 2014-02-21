define([
	'compose',
	'./_Stateful',
	'ksf/base/Evented'
], function(
	compose,
	_Stateful,
	Evented
){
	return compose(_Stateful, Evented, {
		computeValueFromChanges: function(arg, initValue) {},
		_applyChanges: function(changes) {
			this._writeValue(this.computeValueFromChanges(changes, this.getValue()));
			this._emit('changes', changes);
			return changes;
		},
		
		onChanges: function(listener) {
			return this.on('changes', function(changes) {
				if (changes.length > 0) {
					listener(changes);
				}
			});
		},
		
		computeChangesFromPatch: function(arg, initValue) { return arg; },
		patchValue: function(patch) {
			return this._applyChanges(this.computeChangesFromPatch(patch, this.getValue()));
		},
		
		computeChangesFromSet: function(arg, initValue) {},
		setValue: function(arg) {
			return this._applyChanges(this.computeChangesFromSet(arg, this.getValue()));
		},
	});
});