import compose from '../utils/compose';
import _Evented from '../base/_Evented';
import sortedIndex from '../utils/sortedIndex';

export default compose(_Evented, function(source, compareFn) {
    var self = this;
    this._source = source;
    this._compareFn = compareFn;

    var value = this._value = Object.keys(this._source.value()).sort(this._compareFn);
    this._source.onChange(function(change) {
        var output = [];
        Object.keys(change).forEach(function(key) {
            var changeAtKey = change[key];
            if ('add' in changeAtKey) {
                var insertIndex = sortedIndex(value, key, compareFn);
                value.splice(insertIndex, 0, key);
                output.push({
                    type: 'add',
                    key: key,
                    beforeKey: value[insertIndex + 1],
                });
            }
            if ('remove' in changeAtKey) {
                var removeIndex = value.indexOf(key);
                value.splice(removeIndex, 1);
                output.push({
                    type: 'remove',
                    key: key,
                });
            }
        });
        self._emit('change', output);
    });
}, {
    value: function() {
        return this._value;
    },
    onChange: function(cb) {
        return this._on('change', cb);
    },
    add: function(key) {
        return this._source.add(key, null);
    }
});