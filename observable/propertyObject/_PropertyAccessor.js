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
		_getValue: function() {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent._getValue()[this._propName];
		},

		_set: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this._parent._patch([{
				type: 'set',
				key: this._propName,
				value: arg
			}]);
		},

		_onValue: function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent._onValue(function() {
				listener(self.get());
			}));
		}
	});
});