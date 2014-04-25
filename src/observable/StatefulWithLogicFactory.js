define([
	'compose',
	'./_StatefulWithLogic'
], function(
	compose,
	_Stateful
){
	var StatefulFactory = compose(function(model) {
		this.ctr = compose(_Stateful, model.accessorMixin, {
			_computer: model.computer,
		}, function(initArg) {
			var computer = this._computer;
			this._value = arguments.length ? computer.initValue(initArg) : computer.initValue();
		});
	});
	return StatefulFactory;
});