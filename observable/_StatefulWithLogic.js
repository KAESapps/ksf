import compose from '../utils/compose';
import _Evented from '../base/_Evented';

var Stateful = compose(_Evented, {
    _getValue: function() {
        return this._value;
    },
    _change: function(changeArg) {
        changeArg = this._computer.computeChangeArg(changeArg, this._value);
        this._value = this._computer.computeValue(changeArg, this._value);
        this._emit('change', changeArg);
        return changeArg;
    },
    _onChange: function(cb) {
      var self = this
      this._on('change', cb)
      return function () {
        self._off('change', cb)
      }
    },
});

export default Stateful;
