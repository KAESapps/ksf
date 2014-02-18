define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_Accessor',
	'../propertyObject/_Computer',
	'../propertyObject/BasicPropertyAccessor',
	'../propertyObject/_CompositePropertyAccessor',
	'../array/_Computer',
	'../array/_Accessor',
	'../array/_CompositeIndexedAccessor',
], function(
	compose,
	_StatefulPropertyObject,
	_PropObjAccessor,
	_PropObjComputer,
	BasicPropertyAccessor,
	_CompositePropertyAccessor,
	_ArrayComputer,
	_ArrayAccessor,
	_CompositeIndexedAccessor
){
	var Noop = compose({
		_computeValueFromSet: function(arg) {
			return arg;
		}
	});

	var EnumComputer = compose(function(values) {
		this.values = values;
	}, {
		_computeValueFromSet: function(value) {
			if (this.values.indexOf(value) < 0) {
				return undefined;
			}
			return value;
		}
	});

	var DefaultEmptyString = compose({
		_computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var IntegerComputer = compose({
		_computeValueFromSet: function(arg) {
			return typeof(arg) === 'number' ? arg : undefined;
		}
	});

	var ArbreItem = compose(_PropObjComputer, {
		_properties: {
			essence: new EnumComputer([
				"Chêne",
				"Frêne"
			]),
			circonference: new IntegerComputer(),
		}
	});

	var ArbreList = compose(_ArrayComputer, {
		_itemComputer: new ArbreItem()
	});

	var MapAccessor = compose(_CompositeIndexedAccessor, _PropObjAccessor, {
		_createPropertyAccessor: function(id) {
			return new BasicPropertyAccessor(this, id);
		},
	});

	var ArrayOfMapPropertyAccessor = compose(_CompositePropertyAccessor, _ArrayAccessor, {
		_indexAccessorFactory: MapAccessor
	});

	return compose(_StatefulPropertyObject, {
		_properties: {
			nom: {
				computer: new DefaultEmptyString(),
				accessorFactory: BasicPropertyAccessor
			},
			position: {
				computer: new Noop(),
				accessorFactory: BasicPropertyAccessor
			},
			arbres: {
				computer: new ArbreList(),
				accessorFactory: ArrayOfMapPropertyAccessor
			}
		},
		_getPropertyComputer: function(propId) {
			return this._properties[propId].computer;
		},
		_createPropertyAccessor: function(id) {
			return this._properties[id].accessorFactory(this, id);
		},
	});
});