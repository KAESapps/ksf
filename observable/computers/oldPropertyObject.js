define([
	'../../utils/compose',
	'./IncrementalPropertyObject',
	'./ValueOr',
], function(
	compose,
	IncrementalPropertyObject,
	ValueOr
){
	// un PropertyObject est un IncrementalPropertyObject qui inclu pour chaque propriété la logique de ValueOr
	var PropertyObject = compose(IncrementalPropertyObject.prototype, function(properties) {
		var decoratedProperties = this._properties = {};
		Object.keys(properties).forEach(function(key) {
			decoratedProperties[key] = new ValueOr(properties[key]);
		});
	});
	return PropertyObject;
});