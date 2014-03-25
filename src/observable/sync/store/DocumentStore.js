define([
	'compose',
	'./StoreBase',
	'../../computers/propertyObject/Computer',
	'../propertyObject/CompositePropertyAccessor',
	'../propertyObject/_WithPropertyAccessors'
], function(
	compose,
	StoreBase,
	PropertyObjectComputer,
	CompositePropertyAccessor,
	_WithPropertyAccessors
){
	var DocumentStore = function(params) {
		var propertyComputers = {},
			accessorFactories = {};
		for (var key in params.properties) {
			propertyComputers[key] = params.properties[key].computer;
			accessorFactories[key] = params.properties[key].accessorFactory;
		}
		StoreBase.call(this, new PropertyObjectComputer(propertyComputers), compose(CompositePropertyAccessor, _WithPropertyAccessors, {
			_accessorFactories: accessorFactories
		}));
	};
	DocumentStore.prototype = Object.create(StoreBase.prototype);
	return DocumentStore;
});