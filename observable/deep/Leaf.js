import compose from '../../utils/compose';
import _Evented from '../../base/_Evented';
import _Destroyable from '../../base/_Destroyable';
import on from '../../utils/on'

export default compose(_Evented, _Destroyable, function(tree, key) {
    var self = this;
    this._tree = tree;
    this._key = key;
    this._value = tree.value()[key];
    this._own(on(tree, 'change', function(change) {
      if (change.key === key) {
        self._value = change.value;
        self._emit('change', change.value);
      }
    }));
}, {
    change: function(value) {
      return this._tree.change(this._key, value);
    },
    value: function() {
      return this._value;
    },
});
