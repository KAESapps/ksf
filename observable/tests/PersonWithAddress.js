define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_Accessor',
	'../propertyObject/_Computer',
	'../propertyObject/BasicPropertyAccessor',
	'../propertyObject/_CompositePropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	_PropObjAccessor,
	_PropObjComputer,
	BasicPropertyAccessor,
	_CompositePropertyAccessor
){
	var DefaultEmptyString = compose({
		_computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var AddressComputer = compose(_PropObjComputer, {
		_properties: {
			city: new DefaultEmptyString(),
			street: new DefaultEmptyString(),
		}
	});

	var MapPropertyAccessor = compose(_CompositePropertyAccessor, _PropObjAccessor, {
		_createPropertyAccessor: function(id) {
			return new BasicPropertyAccessor(this, id);
		},
	});

	return compose(_StatefulPropertyObject, {
		_properties: {
			firstName: new DefaultEmptyString(),
			lastName: new DefaultEmptyString(),
			address: new AddressComputer()
		},
		_accessorFactories: {
			firstName: BasicPropertyAccessor,
			lastName: BasicPropertyAccessor,
			address: MapPropertyAccessor
		}
	});
});