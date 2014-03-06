define([
	'compose',
	'./_IndexedAccessor'
], function(
	compose,
	_IndexedAccessor
){
	return compose(_IndexedAccessor, {
		patchValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent.patchValue([{
				type: 'patched',
				index: this._getIndex(),
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
			var index = this._getIndex();
			return parentChanges.filter(function(item) {
				return item.type === 'patched' && item.index === index;
			}).map(function(item) {
				return item.arg;
			})[0];
		},
	});
});