import compose from '../../utils/compose';
import ComputedValueAccessorMixin from '../accessorMixins/ComputedValue';
var Value = compose(function(props, computeFn) {
    this.accessorMixin = new ComputedValueAccessorMixin(props, computeFn).ctr;
});
export default Value;