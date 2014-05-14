define([
	"compose",
	'../computers/Dict',
	'../accessorMixins/Dict',
], function(
	compose,
	Computer,
	AccessorMixin
){
	var Dict = compose(function() {
		this.computer = new Computer();
		this.accessorMixin = new AccessorMixin().ctr;
	});
	return Dict;
});