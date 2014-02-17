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

		_addComputedPropertyChanges: function(value, changes) {
			var self = this;
			// TODO: gérer l'arbre des dépendances :
			Object.keys(this._computedProperties).forEach(function(propId) {
				var args = self._computedProperties[propId].deps.map(function(depId) {
					return value[depId];
				}),
					computer = self._getComputedPropertyComputer(propId),
					computedValue = computer._computeValueFromDeps.apply(computer, args);
				changes.push({
					type: 'set',
					key: propId,
					value: computedValue
				});
			});
			return changes;
		},
		_computeChangesFromPatch: function(value, changes) {
			changes = _Computer.prototype._computeChangesFromPatch.call(this, value, changes);
			return this._addComputedPropertyChanges(this._computeValueFromChanges(value, changes), changes);
		},
		_getComputedPropertyComputer: function(propId) {
			return this._computedProperties[propId].computer;
		}
	});
});