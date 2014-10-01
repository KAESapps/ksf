define([
	"../../utils/compose",
	'../computers/AtomicOrderableList',
	'../accessorMixins/Value',
], function(
	compose,
	Computer,
	AccessorMixin
){
	var AtomicOrderableList = compose(function(itemModel) {
		this.computer = new Computer(itemModel.computer);
		this.accessorMixin = new AccessorMixin(itemModel.accessorMixin).ctr;
	});
	return AtomicOrderableList;
});