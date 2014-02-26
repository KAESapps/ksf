define([
	'compose',
	'ksf/base/Destroyable',
	'ksf/base/Evented',
	'../_CompositeStateful',
	'./_Accessor',
	'./_Computer'
], function(
	compose,
	Destroyable,
	Evented,
	_CompositeStateful,
	_Accessor,
	_Computer
){
	var generator = function(args) {
		return compose(Destroyable, Evented, _CompositeStateful.custom(args), _Accessor, _Computer);
	};
	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});