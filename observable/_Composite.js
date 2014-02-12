define([
	'compose',
	'ksf/base/Destroyable',
	'./_Observable'
], function(
	compose,
	Destroyable,
	_Observable
){
	return compose(_Observable, Destroyable, function() {
	}, {
		_computeStateFromPatch: function(arg) {
			// hook for converting patch() argument into a state
		},
		_compute: function() {
			this.patch();
		},
		patch: function(arg) {
			this._observableState.set(this._computeStateFromPatch(arg));
		},
		_addAccessor: function(accessor) {
			this.own(accessor);
			accessor.setParent(this);
		},
		_removeAccessor: function(accessor) {
			this.unown(accessor);
			accessor.destroy();
		}
	});
});