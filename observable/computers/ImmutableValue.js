import compose from '../../utils/compose';
var Value = compose(function(value) {
    this._value = value;
}, {
    initValue: function(initValue) {
        return this._value;
    },
});
export default Value;