define([
	"../../utils/compose",
	'../computers/Value',
	'../accessorMixins/Value',
], function(
	compose,
	ValueComputer,
	ValueAccessorMixin
){
	var Value = compose(function(defaultValue) {
		this.computer = new ValueComputer(defaultValue);
		this.accessorMixin = new ValueAccessorMixin().ctr;
	});
	return Value;
});