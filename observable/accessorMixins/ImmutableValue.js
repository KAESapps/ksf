import compose from '../../utils/compose';
var ValueAPI = {
    value: function() {
        return this._getValue();
    },
};

var Value = compose(function() {
    this.ctr = compose(ValueAPI);
});
export default Value;