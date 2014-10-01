define([
	'../utils/compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	return compose(_Evented, function(source, key) {
		var self = this;
		this._source = source;
		this._key = key;

		var sourceValueAtKey = source.value()[key];
		this._value = (sourceValueAtKey === undefined) ? null : sourceValueAtKey;
		source.onChange(function(change) {
			Object.keys(change).forEach(function(changeKey) {
				if (changeKey === key) {
					var changeAtKey = change[changeKey];
					if ('add' in changeAtKey) {
						self._value = changeAtKey.add;
					}
					if ('remove' in changeAtKey) {
						self._value = null;
					}
					if ('set' in changeAtKey) {
						self._value = changeAtKey.set;
					}
					self._emit('change', self._value);
				}
			});
		});
	}, {
		value: function(value) {
			if (arguments.length) {
				var arg = {};
				arg[this._key] = value;
				return this._source.change(arg);
			} else {
				return this._value;
			}
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
	});
});