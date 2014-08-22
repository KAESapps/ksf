define([
	'compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	return compose(_Evented, function() {
		this._value = {};
	}, {
		// @param change objet de la forme {key1: 'add', key2: 'remove'}
		change: function(change) {
			var value = this._value;
			Object.keys(change).forEach(function(key) {
				if (change[key] === 'add') {
					if (key in value) {
						throw new Error('Key is already present', key);
					}
					value[key] = true;
				}
				if (change[key] === 'remove') {
					if (!(key in value)) {
						throw new Error('Key is not present', key);
					}
					delete value[key];
				}
			});
			this._emit('change', change);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
		value: function(keys) {
			if (arguments.length) {
				var value = this._value;
				var change = {};
				Object.keys(value).forEach(function(key) {
					if (keys.indexOf(key) < 0) {
						change[key] = 'remove';
					}
				});
				keys.forEach(function(key) {
					if (!(key in value)) {
						change[key] = 'add';
					}
				});
				this.change(change);
				return this;
			}
			return Object.keys(this._value);
		},
		add: function(key) {
			var arg = {};
			arg[key] = 'add';
			return this.change(arg);
		},
		remove: function(key) {
			var arg = {};
			arg[key] = 'remove';
			return this.change(arg);
		},
	});
});
