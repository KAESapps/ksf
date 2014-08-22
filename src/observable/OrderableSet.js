define([
	'compose',
	'../base/_Evented',
], function(
	compose,
	_Evented
) {
	function add (value, key, beforeKey) {
		var insertIndex;
		if ('beforeKey' !== undefined) {
			var beforeKeyIndex = value.indexOf(beforeKey);
			if (beforeKeyIndex < 0) {
				throw new Error('beforeKey is not present in set', beforeKey, value);
			}
			insertIndex = beforeKeyIndex;
		} else {
			insertIndex = value.length;
		}
		value.splice(insertIndex, 0, key);
	}

	function remove (value, key) {
		var removeIndex = value.indexOf(key);
		if (removeIndex<0) {
			throw new Error('Key is not present in set', key, value);
		}
		value.splice(removeIndex, 1);
	}

	return compose(_Evented, function(initValue) {
		this._value = initValue || [];
	}, {
/*		@param change objet de la forme [
			{type: 'add', key: 'key1', beforeKey: 'key2'},
			{type: 'remove', key: 'key2'},
			{type: 'move', key: 'key3', beforeKey: key}}
		]
*/		change: function(changes) {
			var value = this._value;
			changes.forEach(function(change) {
				if (change.type === 'add') {
					add(value, change.key, change.beforeKey);
				}
				if (change.type === 'remove') {
					remove(value, change.key);
				}
				if (change.type === 'move') {
					remove(value, change.key);
					add(value, change.key, change.beforeKey);
				}
			});
			this._emit('change', changes);
		},
		onChange: function(cb) {
			return this._on('change', cb);
		},
		value: function(keys) {
			if (arguments.length) {
				throw new Error('not implemented yet');
			}
			return this._value;
		},
	});
});
