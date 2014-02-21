define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	return compose(Destroyable, function(parent, propName) {
		this._parent = parent;
		this._propName = propName;
	}, {
		getValue: function() {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent.getValue()[this._propName];
		},

		setValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this._parent.patchValue([{
				type: 'set',
				key: this._propName,
				value: arg
			}]);
		},

		onValue: function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent.onValue(function() {
				listener(self.getValue());
			}));
		},
	});
});