define([
	'compose',
	'./BasicPropertyObject',
	'./ValueOr',
], function(
	compose,
	BasicPropertyObject,
	ValueOr
){
	// un PropertyObject est un BasicPropertyObject qui inclu pour chaque propriété la logique de ValueOr
	var PropertyObject = compose(BasicPropertyObject.prototype, function(properties) {
		var decoratedProperties = this._properties = {};
		Object.keys(properties).forEach(function(key) {
			decoratedProperties[key] = new ValueOr(properties[key]);
		});
	});
	return PropertyObject;
});