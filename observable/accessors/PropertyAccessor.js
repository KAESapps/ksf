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
		setParent: function(parent) {
			this._parent = parent;
		},
		get: function() {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent.get()[this._propName];
		},
		set: function(value) {
			if (this._destroyed) { throw "Destroyed"; }
			var obj = {};
			obj[this._propName] = value;
			this._parent.patch(obj);
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