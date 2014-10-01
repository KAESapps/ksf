define([
	'../utils/compose',
	'../base/_Destroyable',
	'./bindDict',
	'./Dict',
], function(
	compose,
	_Destroyable,
	bindDict,
	Dict
) {

	return compose(_Destroyable, function(source, filterFn) {
		this._source = source;

		this._value = new Dict();
		this._own(bindDict(source, {
			add: function(key, value) {
				if (filterFn(key)) {
					this.add(key, value);
				}
			},
			remove: function(key) {
				if (filterFn(key)) {
					this.remove(key);
				}
			},
			set: function(key, value) {
				if (filterFn(key)) {
					this.set(key, value);
				}
			},
		}, this._value));
	}, {
		value: function() {
			return this._value.value();
		},
		onChange: function(cb) {
			return this._value.onChange(cb);
		},
		change: function(change) {
			return this._source.change(change);
		},
		add: function(key, value) {
			return this._source.add(key, value);
		},
		remove: function(key) {
			return this._source.remove(key);
		},
		set: function(key, value) {
			return this._source.set(key, value);
		},
	});

});