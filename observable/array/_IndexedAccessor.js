define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	return compose(Destroyable, function(parent) {
		this._parent = parent;
	}, {
		_getIndex: function() {
			return this._parent.getIndexedAccessorIndex(this);
		},
		getValue: function() {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent.getValue()[this._getIndex()];
		},

		setValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			var parentPatch = [{
				type: 'set',
				index: this._getIndex(),
				value: arg
			}];
			this._parent.patchValue(parentPatch);
		},

		onValue: function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent.onValue(function() {
				listener(self.get());
			}));
		}
	});
});