import _Destroyable from '../base/_Destroyable'
import compose from '../utils/compose'
import Value from './Value'

export default compose(_Destroyable, function(cb){
	this._value = new Value()
	this._own(cb(this._value))
}, {
	value: function() {
		return this._value.value();
	},
	onChange: function(cb) {
			return this._value.onChange(cb);
	},
	offChange: function(cb) {
			return this._value.offChange(cb);
	},
})
