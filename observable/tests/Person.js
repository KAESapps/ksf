define([
	'compose',
	'../_StatefulMap',
	'../accessors/BasicPropertyAccessor'
], function(
	compose,
	_StatefulMap,
	BasicPropertyAccessor
){
	var StringProperty = compose({
		compute: function(value) {
			return typeof(value) === 'string' ? value : '';
		},
		accessorFactory: BasicPropertyAccessor
	});

	var StringComputedProperty = compose(function(fct) {
		this.compute = fct;
	}, {
		accessorFactory: BasicPropertyAccessor
	});

	return compose(_StatefulMap, {
		_properties: {
			firstName: new StringProperty(),
			lastName: new StringProperty()
		},
		_computedProperties: {
			fullName: {
				propertyObject: new StringComputedProperty(function(firstName, lastName) {
					return (firstName + ' ' + lastName).trim();
				}),
				deps: ['firstName', 'lastName']
			}
		}
	});
});