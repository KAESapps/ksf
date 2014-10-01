define([
	'../../utils/compose',
], function(
	compose
){
	var PropertyAccessor = compose(function(source, key) {
		this._source = source;
		this._key = key;
	}, {
		value: function(value) {
			if (arguments.length) {
				return this._change(value);
			}
			var sourceValue = this._source._getValue();
			return sourceValue[this._key];
		},
		_change: function(value) {
			var sourceChangeArg = {};
			sourceChangeArg[this._key] = { value: value };
			return this._source._change(sourceChangeArg)[this._key].value;
		},
		onChange: function(cb) {
			var key = this._key;
			return this._source._onChange(function(sourceChanges) {
				var itemChange = sourceChanges[key];
				if (itemChange && 'value' in itemChange) {
					cb(itemChange.value);
				}
			});
		},
	});

	var Dict = compose(function() {
		this.ctr = compose({
			prop: function(prop) {
				return new PropertyAccessor(this, prop);
			},
			value: function() {
				return this._getValue();
			},
			onChange: function(cb) {
				return this._onChange(cb);
			},
		});
	});
	return Dict;
});