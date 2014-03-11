define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_Accessor',
	'../propertyObject/_Computer',
	'../propertyObject/PropertyAccessor',
	'../propertyObject/_CompositePropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	_PropObjAccessor,
	_PropObjComputer,
	PropertyAccessor,
	_CompositePropertyAccessor
){
	var DefaultEmptyString = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var AddressComputer = compose(_PropObjComputer, {
		_properties: {
			city: new DefaultEmptyString(),
			street: new DefaultEmptyString(),
		}
	});

	var BasicPropertyAccessor = PropertyAccessor.custom({
		getValue: 'get',
		setValue: 'set',
		parentGetValue: 'get'
	});
	
	var MapPropertyAccessor = _CompositePropertyAccessor.custom({
		getValue: 'get',
		setValue: 'set',
		parentGetValue: 'get'
	});
	MapPropertyAccessor.prototype._createPropertyAccessor = function(id) {
		return new BasicPropertyAccessor(this, id);
	};
	MapPropertyAccessor.prototype.getProperty = _PropObjAccessor.prototype.getPropertyAccessor;

	return compose(_StatefulPropertyObject.custom({
		getValue: 'get',
		setValue: 'set'
	}), {
		_properties: {
			firstName: new DefaultEmptyString(),
			lastName: new DefaultEmptyString(),
			address: new AddressComputer()
		},
		_accessorFactories: {
			firstName: BasicPropertyAccessor,
			lastName: BasicPropertyAccessor,
			address: MapPropertyAccessor
		},
		getProperty: _PropObjAccessor.prototype.getPropertyAccessor,
	});
});