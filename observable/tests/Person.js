define([
	'compose',
	'../_CompositeByProperty',
	'../accessors/PropertyAccessor'
], function(
	compose,
	_CompositeByProperty,
	PropertyAccessor
){
	var StringProperty = compose({
		compute: function(value) {
			return typeof(value) === 'string' ? value : '';
		},
		accessorFactory: PropertyAccessor
	});

	var StringComputedProperty = compose(function(fct) {
		this.compute = fct;
	}, {
		accessorFactory: PropertyAccessor
	});

	return compose(_CompositeByProperty, {
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