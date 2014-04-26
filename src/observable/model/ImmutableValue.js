define([
	"compose",
	'../computers/ImmutableValue',
	'../accessorMixins/ImmutableValue',
], function(
	compose,
	ValueComputer,
	ValueAccessorMixin
){
	var ImmutableValue = compose(function(value) {
		this.computer = new ValueComputer(value);
		this.accessorMixin = new ValueAccessorMixin().ctr;
	});
	return ImmutableValue;
});