define([
	'../../utils/compose',
	'../../base/_Evented',
], function(
	compose,
	_Evented
) {
	return compose(_Evented, function(tree, key) {
		var self = this;
		this._tree = tree;
		this._key = key;
		this._value = tree.value()[key];
		tree.onChange(function(change) {
			if (change.key === key) {
				this._value = change.value;
				self._emit('change', change.value);
			}
		});
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