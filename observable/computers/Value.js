import compose from '../../utils/compose';
var Value = compose(function(defaultValue) {
    this._defaultValue = defaultValue;
}, {
    initValue: function(initValue) {
        return arguments.length ? initValue : this._defaultValue;
    },
    computeValue: function(changeArg, initValue) {
        return changeArg;
    },
    computeChangeArg: function(changeArg, initValue) {
        return changeArg;
    },
});
export default Value;