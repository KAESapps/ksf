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
		computedProperties: {},

		_addComputedPropertyChanges: function(changes, value) {
			var self = this;
			// TODO: gérer l'arbre des dépendances :
			Object.keys(this.computedProperties).forEach(function(propId) {
				var args = self.computedProperties[propId].deps.map(function(depId) {
					return value[depId];
				}),
					computer = self._getComputedPropertyComputer(propId),
					computedValue = computer.computeValueFromDeps.apply(computer, args);
				changes.push({
					type: 'set',
					key: propId,
					value: computedValue
				});
			});
			return changes;
		},
		computeChangesFromPatch: function(changes, value) {
			changes = _Computer.prototype.computeChangesFromPatch.call(this, changes, value);
			return this._addComputedPropertyChanges(changes, this.computeValueFromChanges(changes, value));
		},
		_getComputedPropertyComputer: function(propId) {
			return this.computedProperties[propId].computer;
		}
	});
});