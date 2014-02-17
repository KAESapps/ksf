define([
	'compose',
	'./_PropertyAccessor'
], function(
	compose,
	_PropertyAccessor
){
	return compose(_PropertyAccessor, {
		get: _PropertyAccessor.prototype._getValue,
		set: _PropertyAccessor.prototype._setValue,
		onValue: _PropertyAccessor.prototype._onValue
	});
});