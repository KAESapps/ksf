define([
	'compose',
	'./StoreBase',
	'../propertyObject/PropertyAccessor',
], function(
	compose,
	StoreBase,
	PropertyAccessor
){
	var Store = function(params) {
		StoreBase.call(this, {
			computeValueFromSet: function(value) { return value; }
		},
			PropertyAccessor
		);
	};
	Store.prototype = Object.create(StoreBase.prototype);
	return Store;
});