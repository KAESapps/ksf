define([
	"compose",
	'../computers/Store',
	'../accessorMixins/Store',
], function(
	compose,
	StoreComputer,
	StoreAccessorMixin
){
	var Store = compose(function(itemModel) {
		this.computer = new StoreComputer(itemModel.computer);
		this.accessorMixin = new StoreAccessorMixin(itemModel.accessorMixin).ctr;
	}, {
		defaultValue: function() {
			return {};
		},
	});
	return Store;
});