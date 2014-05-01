define([
	"compose",
	'../computers/Store',
	'../accessorMixins/Store',
], function(
	compose,
	StoreComputer,
	StoreAccessorMixin
){
	var Store = compose(function(itemModel, aggregates) {
		this.computer = new StoreComputer(itemModel.computer);
		this.accessorMixin = new StoreAccessorMixin(itemModel.accessorMixin, aggregates).ctr;
	});
	return Store;
});