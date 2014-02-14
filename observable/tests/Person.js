define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_WithComputedProperties',
	'../propertyObject/BasicPropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	_WithComputedProperties,
	BasicPropertyAccessor
){
	var DefaultEmptyString = compose({
		_computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var StringComputer = compose(function(fct) {
		this._computeValueFromSet = fct;
	});

	return compose(_StatefulPropertyObject, _WithComputedProperties, {
		_properties: {
			firstName: new DefaultEmptyString(),
			lastName: new DefaultEmptyString()
		},
		_computedProperties: {
			fullName: {
				computer: new StringComputer(function(firstName, lastName) {
					return (firstName + ' ' + lastName).trim();
				}),
				deps: ['firstName', 'lastName']
			}
		},
		_accessorFactories: {
			firstName: BasicPropertyAccessor,
			lastName: BasicPropertyAccessor,
			fullName: BasicPropertyAccessor
		}
	});
});