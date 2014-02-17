define([
	'compose',
	'./_IndexedAccessor'
], function(
	compose,
	_IndexedAccessor
){
	return compose(_IndexedAccessor, {
		_patch: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this._parent._patch([{
				type: 'patched',
				index: this._getIndex(),
				arg: arg
			}]);
		}
	});
});