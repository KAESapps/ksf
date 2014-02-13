define([
	'compose',
	'../_StatefulMap',
	'../accessors/BasicPropertyAccessor',
	'../accessors/_MapPropertyAccessor'
], function(
	compose,
	_StatefulMap,
	BasicPropertyAccessor,
	_MapPropertyAccessor
){
	var StringProperty = compose({
		compute: function(value) {
			return value;
		},
		accessorFactory: BasicPropertyAccessor
	});

	var AddressProperty = compose({
		compute: function(value) {
			return value;
		},
		accessorFactory: compose(_MapPropertyAccessor, {
			_properties: {
				street: new StringProperty(),
				city: new StringProperty(),
			},
		})
	});

	return compose(_StatefulMap, {
		_properties: {
			firstName: new StringProperty(),
			lastName: new StringProperty(),
			address: new AddressProperty()
		},
	});
});