import compose from '../../utils/compose';
import _Evented from '../../base/_Evented';
import _Destroyable from '../../base/_Destroyable';
import FlatValue from '../FlatValue';
import MappedValue from '../MappedValue';
import Value from '../Value';
import Leaf from './Leaf';
// comme Leaf, permet d'avoir une valeur observable pour une clé d'un store mais cette clé étant dynamique
export default compose(_Evented, _Destroyable, function(tree, keyStream) {
    this._value = this._own(new FlatValue(new MappedValue(keyStream, function(key) {
        // si la clé est 'undefined', on ne cherche même pas à observer le store
        return key === undefined ? new Value(undefined) : new Leaf(tree, key);
    })));
}, {
    onChange: function(cb) {
        return this._value.onChange(cb);
    },
    value: function() {
        return this._value.value();
    }
});