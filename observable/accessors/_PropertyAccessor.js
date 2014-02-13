define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	return compose(Destroyable, function(propName) {
		this._propName = propName;
	}, {
		/* required method during composition */
		_computeStateFromSet: function(setArg) {},

		setParent: function(parent) {
			this._parent = parent;
		},
		
		get: function() {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent.get()[this._propName];
		},

		_setState: function(state) {
			if (this._destroyed) { throw "Destroyed"; }
			var parentPatch = {};
			parentPatch[this._propName] = state;
			this._parent.patch(parentPatch);
		},
		set: function(arg) {
			this._setState(this._computeStateFromSet(arg));
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