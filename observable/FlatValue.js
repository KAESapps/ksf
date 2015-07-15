import compose from '../utils/compose';
import _Destroyable from '../base/_Destroyable';
import Value from './Value';
import bindValue from './bindValue';
// observable qui transforme un observable d'observables en observable de valeurs
export default compose(_Destroyable, function(primarySource) {
    var self = this;
    this._value = new Value();
    this._own(bindValue(primarySource, function(secondarySource) {
        self._own(bindValue(secondarySource, function(secondarySourceValue) {
            self._value.value(secondarySourceValue);
        }), 'secondarySourceObserver');
    }));
}, {
    value: function() {
        return this._value.value();
    },
    onChange: function(cb) {
        return this._value.onChange(cb);
    },
});