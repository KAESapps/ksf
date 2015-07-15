import compose from '../../utils/compose';
import Computer from '../computers/AtomicOrderableList';
import AccessorMixin from '../accessorMixins/Value';
var AtomicOrderableList = compose(function(itemModel) {
    this.computer = new Computer(itemModel.computer);
    this.accessorMixin = new AccessorMixin(itemModel.accessorMixin).ctr;
});
export default AtomicOrderableList;