define([
	'compose',
	'./_PropertyAccessor'
], function(
	compose,
	_PropertyAccessor
){
	return compose(_PropertyAccessor, {
		_patchValue: function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this._parent._patchValue([{
				type: 'patched',
				key: this._propName,
				arg: arg
			}]);
		}
	});
});