define([
	'compose',
	'../_CompositeStateful',
	'./_Accessor',
	'./_Computer'
], function(
	compose,
	_CompositeStateful,
	_Accessor,
	_Computer
){
	return compose(_CompositeStateful, _Accessor, _Computer);
});