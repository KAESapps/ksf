define([
	'compose',
	'./_PropertyAccessor'
], function(
	compose,
	_PropertyAccessor
){
	return compose(_PropertyAccessor, {
		_computeStateFromSet: function(setArg) {
			return setArg;
		}
	});
});