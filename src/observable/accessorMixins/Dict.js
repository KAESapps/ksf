define([
	'compose',
], function(
	compose
){
	var PropertyAccessor = compose(function(source, key) {
		this._source = source;
		this._key = key;
	}, {
		value: function() {
			var sourceValue = this._source._getValue();
			return sourceValue[this._key];
		},
		_change: function(changeArg) {
			var sourceChangeArg = {};
			sourceChangeArg[this._key] = changeArg;
			return this._source._change(sourceChangeArg)[this._key];
		},
		onChange: function(cb) {
			var key = this._key;
			return this._source._onChange(function(sourceChanges) {
				if (key in sourceChanges) {
					cb(sourceChanges[key]);
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