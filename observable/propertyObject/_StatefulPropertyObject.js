define([
	'compose',
	'ksf/base/Destroyable',
	'../_CompositeStateful',
	'./_Accessor',
	'./_Computer'
], function(
	compose,
	Destroyable,
	_CompositeStateful,
	_Accessor,
	_Computer
){
	return compose(Destroyable, _CompositeStateful, _Accessor, _Computer);
});