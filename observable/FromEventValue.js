import compose from '../utils/compose';
import _Destroyable from '../base/_Destroyable';
import Value from './Value';
import on from '../utils/on';

export default compose(_Destroyable, function(source, eventName, create) {
    this._source = source;
    var value = this._value = new Value(create());
    this._own(on(source, eventName, function(ev) {
        value.value(create(ev));
    }))
}, {
    value: function(value) {
      return this._value.value();
    },
    onChange: function(cb) {
        return this._value.onChange(cb);
    },
});
