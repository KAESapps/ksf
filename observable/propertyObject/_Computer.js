define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose({
		_computeChangesFromSet: function(currentValue, arg) {
			arg = arg || {};
			currentValue = currentValue || {};

			var changes = [],
				self = this;
			
			Object.keys(this._properties).forEach(function(propId) {
				var propComputer = self._getPropertyComputer(propId),
					propValue;
				if (propComputer._computeChangesFromSet) {
					changes.push({
						type: 'patched',
						key: propId,
						arg: propComputer._computeChangesFromSet(currentValue[propId], arg[propId])
					});
				} else {
					changes.push({
						type: 'set',
						key: propId,
						value: propComputer._computeValueFromSet(arg[propId], currentValue[propId])
					});
				}
			});
			return this._computeChangesFromPatch(currentValue, changes);
		},
		_computeChangesFromPatch: function(initValue, propChanges) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			propChanges.forEach(function(change) {
				var propComputer = this._getPropertyComputer(change.key);
				if (change.type === 'patched') {
					change.arg = propComputer._computeChangesFromPatch(initValue[change.key], change.arg);
				} else if (change.type === 'set') {
					change.value = propComputer._computeValueFromSet(change.value, initValue[change.key]);
				}
			}.bind(this));
			return propChanges;
		},
		/*
			@param: propChanges
				example:
				[{
					type: 'set',
					key: 'prop1',
					value: 'tata'
				}, {
					type: 'patched',
					key: 'prop2'
					arg: (...)
				}]
		*/
		_computeValueFromChanges: function(initValue, propChanges) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			var newValue = clone(initValue);
			propChanges.forEach(function(change) {
				var propValue;
				if (change.type === 'patched') {
					var propComputer = this._getPropertyComputer(change.key);
					propValue = propComputer._computeValueFromChanges(initValue[change.key], change.arg);
				} else if (change.type === 'set') {
					propValue = change.value;
				}
				newValue[change.key] = propValue;
			}.bind(this));
			return newValue;
		},

		_computeValueFromSet: function(arg, initValue) {
			return this._computeValueFromChanges(initValue, this._computeChangesFromSet(initValue, arg));
		},

		_getPropertyComputer: function(propId) {
			return this._properties[propId];
		}
	});
});