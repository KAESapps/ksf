define([
	'../utils/compose',
	'../base/_Destroyable',
	'./Value',
	'./bindValue',
], function(
	compose,
	_Destroyable,
	Value,
	bindValue
) {

	return compose(_Destroyable, function(source, convert, revert) {
		this._value = new Value();
		this._own(bindValue(source, function(sourceValue) {
			this.value(convert(sourceValue));
		}, this._value));
		this._revert = revert;
	}, {
		value: function(value) {
			if (arguments.length) {
				return this._revert && this._source.value(this._revert.call(null, value));
			} else {
				return this._value.value();
			}
		},
		onChange: function(cb) {
			return this._value.onChange(cb);
		},
	});

});