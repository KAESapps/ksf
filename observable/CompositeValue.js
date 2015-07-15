import compose from '../utils/compose';
import _Evented from '../base/_Evented';
import _Destroyable from '../base/_Destroyable';
// c'est un observable de valeur atomique qui combine plusieurs observables de valeur atomique
// on ne tente pas de permettre une observation transactionnelle de toutes les valeurs : dès qu'une source pulse, on pulse la valeur composite mise à jour
// c'est un combine avec une structure clé/valeur, c'est tout
export default compose(_Evented, _Destroyable, function(values) {
    var self = this;
    var value = this._value = {};
    Object.keys(values).forEach(function(key) {
        var observable = values[key];
        // init
        value[key] = values[key].value();
        // update
        self._own(observable.onChange(function(newValue) {
            value[key] = newValue;
            self._emit('change', value);
        }));
    });
}, {
    value: function() {
        return this._value;
    },
    onChange: function(cb) {
        return this._on('change', cb);
    },
});