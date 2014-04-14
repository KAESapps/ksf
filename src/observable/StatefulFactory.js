define([
	'compose',
	'./_Stateful'
], function(
	compose,
	_Stateful
){
	var StatefulFactory = compose(function(model) {
		this.ctr = compose(_Stateful, model.accessorMixin, {
			_computer: model.computer,
		}, function(data) {
			this._value = arguments.length ? data : model.defaultValue();
		});
	});
	return StatefulFactory;
});