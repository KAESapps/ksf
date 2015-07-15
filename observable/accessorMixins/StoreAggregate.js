import compose from '../../utils/compose';

var StoreAggregate = compose(function(reduceFn, initValue) {
    this.ctr = compose(function(source) {
        this._source = source;
    }, {
        value: function() {
            console.time('compute store aggregate');
            var sourceValue = this._source._getValue();
            var ret = Object.keys(sourceValue).reduce(function(acc, itemKey) {
                var itemValue = sourceValue[itemKey];
                return reduceFn(acc, itemValue);
            }, initValue);
            console.timeEnd('compute store aggregate');
            return ret;
        },
        onChange: function(cb) {
            var self = this;
            return this._source.onChange(function() {
                cb(self.value());
            });
        },

    });
});
export default StoreAggregate;