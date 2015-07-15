import compose from '../../utils/compose';
var ValueOr = compose(function(decorated) {
    this._decorated = decorated;
}, {
    computeValue: function(changeArg, initValue) {
        if (changeArg.value) {
            return changeArg.value;
        }
        if (changeArg.change) {
            return this._decorated.computeValue(changeArg.change, initValue);
        }
    },
});
export default ValueOr;