import compose from '../../utils/compose';
import ValueComputer from '../computers/Value';
import ValueAccessorMixin from '../accessorMixins/Value';
var Value = compose(function(defaultValue) {
    this.computer = new ValueComputer(defaultValue);
    this.accessorMixin = new ValueAccessorMixin().ctr;
});
export default Value;