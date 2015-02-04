define([
	'../utils/compose',
	'../base/_Evented',
	'./Set',
], function(
	compose,
	_Evented,
	Set
) {
	/*
	 * Convert a Dict-like observable to a Set-like observable with keys only
	 */
	return compose(_Evented, function(source) {
		this._source = source;

		var value = this._value = new Set(Object.keys(this._source.value()));
		this._source.onChange(function(change) {
			var output = {};
			Object.keys(change).forEach(function(key) {
				var changeAtKey = change[key];
				if ('add' in changeAtKey) {
					output[key] = 'add';
				}
				if ('remove' in changeAtKey) {
					output[key] = 'remove';
				}
			});
			value.change(output);
		});
	}, {
		value: function() {
			return this._value.value();
		},
		onChange: function(cb) {
			return this._value.onChange(cb);
		},
		add: function(key) {
			return this._source.add(key, null);
		},
		remove: function(key) {
			return this._source.remove(key);
		},
	});

});