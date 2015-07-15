import compose from '../../utils/compose';
import _Evented from '../../base/_Evented';

// key-value store (non deep !)
export default compose(_Evented, function(data) {
    this._values = data || {};
}, {
    change: function(key, value) {
        this._undoArgs = {
            key: key,
            value: this._values[key],
        };
        if (value === undefined) {
            delete this._values[key];
        } else {
            this._values[key] = value;
        }
        this._emit('change', {
            key: key,
            value: value,
        });
    },
    onChange: function(cb) {
        return this._on('change', cb);
    },
    value: function() {
        return this._values;
    },
    undo: function() {
        if (this._undoArgs) {
            this.change(this._undoArgs.key, this._undoArgs.value);
            delete this._undoArgs;
            return true;
        }
        return false;
    },
});
