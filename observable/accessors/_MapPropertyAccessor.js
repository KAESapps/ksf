define([
	'compose',
	'./_PropertyAccessor',
	'../_Map'
], function(
	compose,
	_PropertyAccessor,
	_Map
){
	return compose(_PropertyAccessor, _Map);
});