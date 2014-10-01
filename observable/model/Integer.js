define([
	"../../utils/compose",
	'../computers/Integer',
	'../accessorMixins/Value',
], function(
	compose,
	ValueComputer,
	ValueAccessorMixin
){
	var Integer = compose(function() {
		this.computer = new ValueComputer();
		this.accessorMixin = new ValueAccessorMixin().ctr;
	});
	return Integer;
});