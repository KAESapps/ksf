import compose from '../../utils/compose';
import Computer from '../computers/Dict';
import AccessorMixin from '../accessorMixins/Dict';
var Dict = compose(function() {
    this.computer = new Computer();
    this.accessorMixin = new AccessorMixin().ctr;
});
export default Dict;