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
		}, function(changeArg) {
			this._value = model.defaultValue();
			arguments.length && this._change(changeArg);
		});
	});
	return StatefulFactory;
});