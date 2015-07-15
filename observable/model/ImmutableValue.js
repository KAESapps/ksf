import compose from '../../utils/compose';
import ValueComputer from '../computers/ImmutableValue';
import ValueAccessorMixin from '../accessorMixins/ImmutableValue';
var ImmutableValue = compose(function(value) {
    this.computer = new ValueComputer(value);
    this.accessorMixin = new ValueAccessorMixin().ctr;
});
export default ImmutableValue;