define([
	'compose',
	'./_Stateful',
	'./_Map'
], function(
	compose,
	_Stateful,
	_Map
){
	return compose(_Stateful, _Map, function() {
		this._compute();
	});
});