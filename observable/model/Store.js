import compose from '../../utils/compose';
import StoreComputer from '../computers/Store';
import StoreAccessorMixin from '../accessorMixins/Store';
var Store = compose(function(itemModel, aggregates) {
    this.computer = new StoreComputer(itemModel.computer);
    this.accessorMixin = new StoreAccessorMixin(itemModel.accessorMixin, aggregates).ctr;
});
export default Store;