define([
	'compose',
	'./_PropertyAccessor',
	'../_Array'
], function(
	compose,
	_PropertyAccessor,
	_Array
){
	return compose(_PropertyAccessor, _Array);
});