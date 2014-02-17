define([
	'compose',
	'./_Computer',
	'lodash/objects/clone'
], function(
	compose,
	_Computer,
	clone
){
	return compose({
		_computedProperties: {},

		_applyComputedProperties: function(newValue) {
			var self = this;
			// TODO: gérer l'arbre des dépendances :
			Object.keys(this._computedProperties).forEach(function(propId) {
				var args = self._computedProperties[propId].deps.map(function(depId) {
					return newValue[depId];
				}),
					computer = self._getComputedPropertyComputer(propId);
				newValue[propId] = computer._computeValueFromSet.apply(computer, args);
			});
			return newValue;
		},
		_computeValueFromSet: function(arg) {
			var newValue = _Computer.prototype._computeValueFromSet.call(this, arg);
			return this._applyComputedProperties(newValue);
		},
		_computeValueFromPatch: function(initValue, propChanges) {
			var newValue = _Computer.prototype._computeValueFromPatch.call(this, initValue, propChanges);
			return this._applyComputedProperties(newValue);
		},
		_getComputedPropertyComputer: function(propId) {
			return this._computedProperties[propId].computer;
		}
	});
});