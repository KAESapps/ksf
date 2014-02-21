define([
	'compose',
	'./PropertyAccessor'
], function(
	compose,
	PropertyAccessor
){
	return compose(PropertyAccessor, {
		patchValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this._parent.patchValue([{
				type: 'patched',
				key: this._propName,
				arg: arg
			}]);
		},

		onChanges: function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent.onChanges(function(changes) {
				var selfChanges = self._getChanges(changes);
				if (selfChanges.length > 0) {
					listener(selfChanges);
				}
			}));
		},

		_getChanges: function(parentChanges) {
			var propName = this._propName;
			return parentChanges.filter(function(item) {
				return item.type === 'patched' && item.key === propName;
			}).map(function(item) {
				return item.arg;
			})[0];
		},
	});
});