import compose from '../utils/compose';
import Value from './Value';
// permet de créer une valeur réactive à partir d'un promise
// tant que le promise n'est pas résolu, la valeur est null (et il n'y a pas moeyn de savoir s'il y a eu une erreur)
export default compose(function(promise) {
    this._value = new Value(null)
    promise
      .then((val) => this._value.value(val))
      .catch((err) => console.warn(err))
}, {
    value: function() {
      return this._value.value();
    },
    onChange: function(cb) {
      return this._value.onChange(cb);
    },
});
