define([
	'compose',
	'../CompositeStateful',
	'../propertyObject/_WithPropertyAccessors',
	'../../computers/propertyObject/Computer',
	'../propertyObject/PropertyAccessor',
	'../propertyObject/CompositePropertyAccessor'
], function(
	compose,
	CompositeStateful,
	WithPropertyAccessors,
	PropObjComputer,
	PropertyAccessor,
	PropObjCompositePropertyAccessor
){
	var StringProperty = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		},
		accessorFactory: PropertyAccessor
	});

	var PropertyObjectProperty = compose(PropObjComputer, function(properties) {
		this._propertyComputers = properties;
		var accessorFactories = {};
		for (var p in properties) {
			accessorFactories[p] = properties[p].accessorFactory;
		}
		this.accessorFactory = compose(PropObjCompositePropertyAccessor, WithPropertyAccessors, {
			_accessorFactories: accessorFactories
		});
	});


	var PropertyObject = compose(function(properties) {
		this._constructor = compose(CompositeStateful, WithPropertyAccessors, {
			_computer: compose.create(PropObjComputer, {
				_propertyComputers: {},
			}),
			_accessorFactories: {}
		});

		for (var p in properties) {
			this.addProperty(p, properties[p]);
		}
	}, {
		addProperty: function(propName, property) {
			this._constructor.prototype._computer._propertyComputers[propName] = property;
			this._constructor.prototype._accessorFactories[propName] = property.accessorFactory;
		}
	});


	var PersonWithAddressMeta = new PropertyObject({
		firstName: new StringProperty(),
		lastName: new StringProperty(),
		address: new PropertyObjectProperty({
			street: new StringProperty(),
			city: new StringProperty(),
		}),
	});

	return PersonWithAddressMeta._constructor;

});