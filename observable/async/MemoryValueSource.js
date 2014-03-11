define([
	'compose',
	'dojo/Deferred',
	'ksf/base/Evented',
	'ksf/base/Destroyable'
], function(
	compose,
	Deferred,
	Evented,
	Destroyable
){
	return compose(Destroyable, Evented, {
		getValue: function() {
			var dfd = new Deferred();
			dfd.resolve(this._value);
			return dfd;
		},
		setValue: function(value) {
			if (value === undefined && this._value !== undefined) { throw "Specify a value"; }
			
			this._value = value;
			this._emit('value', this._value);
			
			var dfd = new Deferred();
			dfd.resolve();
			return dfd;
		},
		onValue: function(listener) {
			var handler = this.own(this.on('value', listener));
			return handler.destroy;
		}
	});
});