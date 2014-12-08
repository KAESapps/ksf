define([
	'../../utils/compose',
	'../../base/_Evented',
	'../../base/_Destroyable',
], function(
	compose,
	_Evented,
	_Destroyable
) {
	return compose(_Evented, _Destroyable, function(tree, key) {
		var self = this;
		this._tree = tree;
		this._key = key;
		this._value = tree.value()[key];
		this._own(tree.onChange(function(change) {
			if (change.key === key) {
				self._value = change.value;
				self._emit('change', change.value);
			}
		}));
	}, {
		onChange: function(cb) {
			return this._on('change', cb);
		},
		change: function(value) {
			return this._tree.change(this._key, value);
		},
		value: function() {
			return this._value;
		}
	});

});