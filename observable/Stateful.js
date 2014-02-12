define([
	'compose',
	'ksf/base/Evented',
	'ksf/base/Destroyable'
], function(
	compose,
	Evented,
	Destroyable
){
	return compose(Evented, Destroyable, function(initialValue) {
		this.set(initialValue);
	}, {
		get: function() {
			return this._state;
		},
		set: function(value) {
			this._state = value;
			this._emit('value', this._state);
		},
		onValue: function(listener) {
			var canceler = this.on('value', listener);
			listener(this._state);
			return canceler.destroy;
		}
	});
});