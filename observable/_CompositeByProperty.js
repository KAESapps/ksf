define([
	'compose',
	'./_Composite'
], function(
	compose,
	_Composite
){
	return compose(_Composite, function() {
		this._compute();
	}, {
		_properties: {},
		_computedProperties: {},
		_computeStateFromSet: function(arg) {
			arg = arg || {};
			var newState = {},
				self = this;
			Object.keys(this._properties).forEach(function(propId) {
				newState[propId] = self._properties[propId].compute(arg[propId]);
			});
			// TODO: gérer l'arbre des dépendances :
			Object.keys(this._computedProperties).forEach(function(propId) {
				var args = self._computedProperties[propId].deps.map(function(depId) {
					return newState[depId];
				});
				newState[propId] = self._computedProperties[propId].propertyObject.compute.apply(undefined, args);
			});
			return newState;
		},
		_computeStateFromPatch: function(arg) {
			arg = arg || {};
			var setArg = this.get();
			Object.keys(arg).forEach(function(key) {
				setArg[key] = arg[key];
			});
			return this._computeStateFromSet(setArg);
		},
		getProperty: function(propId) {
			var accessor = this._properties[propId].accessorFactory(propId);
			this._addAccessor(accessor);
			return accessor;
		}
	});
});