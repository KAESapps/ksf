define([
	'compose',
	'ksf/base/Evented',
	'ksf/base/Destroyable'
], function(
	compose,
	Evented,
	Destroyable
){
	return compose(Destroyable, Evented, function(source) {
		this._source = source;
		var self = this;
		this.own(source.on('value', function() {
			self._emit('value', self.value());
		}));
	}, {
		value: function() {
			return this._computeValue(this._source.value());
		},
		withValue: function(cb) {
			cb(this.value());
			return this.own(this.on('value', cb));
		}
	});
});