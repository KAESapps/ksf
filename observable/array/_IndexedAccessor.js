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
			return this._parent._getIndexedAccessorIndex(this);
		},
		_getValue: function() {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent._getValue()[this._getIndex()];
		},

		_applyValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			var parentPatch = [{
				type: 'set',
				index: this._getIndex(),
				value: arg
			}];
			this._parent._patch(parentPatch);
		},

		_onValue: function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent._onValue(function() {
				listener(self.get());
			}));
		},


		get: function() {
			return this._getValue();
		},

		set: function(arg) {
			return this._applyValue(arg);
		}
	});
});