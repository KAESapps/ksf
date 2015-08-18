import _Evented from '../base/_Evented';
import compose from '../utils/compose';
export default compose(_Evented, function(initValue){
	this._value = initValue;
}, {
	value: function(newValue) {
		if (arguments.length) {
			return this.change(newValue);
		} else {
			return this._value;
		}
	},
	change: function(newValue) {
		this._value = newValue;
		this._emit('change', newValue);
	},
	onChange: function(cb) {
		return this._on('change', cb);
	},
	offChange: function(cb) {
		return this._off('change', cb);
	},
})
