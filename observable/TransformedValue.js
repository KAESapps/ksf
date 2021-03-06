import compose from '../utils/compose';
import _Destroyable from '../base/_Destroyable';
import Value from './Value';
import bindValue from './bindValue';
// permet de créer une valeur réactive à partir d'une autre. Mais à la différence de MappedValue, le rythme des changes de la valeur transformée peut être différent de celui de la valeur initiale
export default compose(_Destroyable, function(source, transform, revert) {
    this._source = source;
    this._value = new Value();
    this._own(bindValue(source, transform, this._value));
    this._revert = revert;
}, {
    value: function(value) {
        if (arguments.length) {
            return this.change(value);
        } else {
            return this._value.value();
        }
    },
    change: function(value) {
        return this._revert && this._source.change(this._revert.call(null, value));
    },
    onChange: function(cb) {
        return this._value.onChange(cb);
    },
    offChange: function(cb) {
        return this._value.offChange(cb);
    },
});
