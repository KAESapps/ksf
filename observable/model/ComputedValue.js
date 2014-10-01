define([
	"../../utils/compose",
	'../accessorMixins/ComputedValue',
], function(
	compose,
	ComputedValueAccessorMixin
){
	var Value = compose(function(props, computeFn) {
		this.accessorMixin = new ComputedValueAccessorMixin(props, computeFn).ctr;
	});
	return Value;
});