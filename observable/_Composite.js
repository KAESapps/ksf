define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	return compose(Destroyable, function() {
	}, {
		_computeStateFromPatch: function(arg) {
			// hook for converting patch() argument into a state
		},
		_compute: function() {
			this.patch();
		},
		patch: function(arg) {
			this._setState(this._computeStateFromPatch(arg));
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