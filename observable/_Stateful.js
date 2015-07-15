import compose from '../utils/compose';
import _Evented from '../base/_Evented';

var Stateful = compose(_Evented, {
    _getValue: function() {
        return this._value;
    },
    _change: function(changeArg) {
        this._value = this._computer.computeValue(changeArg, this._value);
        this._emit('change', changeArg);
    },
    _onChange: function(cb) {
        return this._on('change', cb);
    },

});

export default Stateful;