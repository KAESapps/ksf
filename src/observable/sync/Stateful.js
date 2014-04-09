define([
	'compose',
	'./_Stateful',
], function(
	compose,
	_Stateful
){

	var Stateful = compose(_Stateful, function(initValue) {
		this._setValue(initValue);
	});

	return Stateful;
});