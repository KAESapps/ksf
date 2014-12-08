define([
	'../../utils/compose',
	'../../base/_Evented',
	'../../base/_Destroyable',
	'../FlatValue',
	'../MappedValue',
	'../Value',
	'./Leaf',
], function(
	compose,
	_Evented,
	_Destroyable,
	FlatValue,
	MappedValue,
	Value,
	Leaf
) {
	// comme Leaf, permet d'avoir une valeur observable pour une clé d'un store mais cette clé étant dynamique
	return compose(_Evented, _Destroyable, function(tree, keyStream) {
		this._value = this._own(new FlatValue(new MappedValue(keyStream, function(key) {
			// si la clé est 'undefined', on ne cherche même pas à observer le store
			return key === undefined ? new Value(undefined) : new Leaf(tree, key);
		})));
	}, {
		onChange: function(cb) {
			return this._value.onChange(cb);
		},
		value: function() {
			return this._value.value();
		}
	});

});