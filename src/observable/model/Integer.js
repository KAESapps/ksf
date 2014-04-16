define([
	"compose",
	'../computers/Integer',
	'../accessorMixins/Value',
], function(
	compose,
	ValueComputer,
	ValueAccessorMixin
){
	var Value = compose(function() {
		this.computer = new ValueComputer();
		this.accessorMixin = new ValueAccessorMixin().ctr;
	});
	return Value;
});