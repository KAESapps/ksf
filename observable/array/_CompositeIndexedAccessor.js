define([
	'compose',
	'./_IndexedAccessor'
], function(
	compose,
	_IndexedAccessor
){
	return compose(_IndexedAccessor, {
		_patchValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this._parent._patchValue([{
				type: 'patched',
				index: this._getIndex(),
				arg: arg
			}]);
		}
	});
});