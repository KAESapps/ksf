define([
	"compose",
	'../computers/ImplicitDict',
	'../accessorMixins/ImplicitDict',
], function(
	compose,
	ImplicitDictComputer,
	ImplicitDictAccessorMixin
){
	var ImplicitDict = compose(function() {
		this.computer = new ImplicitDictComputer();
		this.accessorMixin = new ImplicitDictAccessorMixin().ctr;
	});
	return ImplicitDict;
});