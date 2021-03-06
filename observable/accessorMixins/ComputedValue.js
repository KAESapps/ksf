import compose from '../../utils/compose';
var ValueAPI = {
    value: function(value) {
        return this._getValue();
    },
    onChange: function(cb) {
        return this._onChange(cb);
    },
};

var Value = compose(function(props, computeFn) {
    this.ctr = compose(ValueAPI, {
        _props: props,
        _computeFn: computeFn,
    });
});
export default Value;