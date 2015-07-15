import compose from '../../utils/compose';
import ValueComputer from '../computers/Integer';
import ValueAccessorMixin from '../accessorMixins/Value';
var Integer = compose(function() {
    this.computer = new ValueComputer();
    this.accessorMixin = new ValueAccessorMixin().ctr;
});
export default Integer;