define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose(function(propertyComputers) {
		this._propertyComputers = propertyComputers;
	}, {
		computeChangesFromSet: function(arg, initValue) {
			arg = arg || {};
			initValue = initValue || {};

			var changes = [],
				self = this;
			
			Object.keys(this._propertyComputers).forEach(function(propId) {
				var propComputer = self._getPropertyComputer(propId);
				changes.push({
					type: 'set',
					key: propId,
					value: propComputer.computeValueFromSet(arg[propId], initValue[propId])
				});
			});
			return this.computeChangesFromPatch(changes, initValue);
		},
		computeChangesFromPatch: function(propChanges, initValue) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			propChanges.forEach(function(change) {
				var propComputer = this._getPropertyComputer(change.key);
				if (change.type === 'patched') {
					change.arg = propComputer.computeChangesFromPatch(change.arg, initValue[change.key]);
				} else if (change.type === 'set') {
					change.value = propComputer.computeValueFromSet(change.value, initValue[change.key]);
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
		computeValueFromChanges: function(propChanges, initValue) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			var newValue = clone(initValue);
			propChanges.forEach(function(change) {
				var propValue;
				if (change.type === 'patched') {
					var propComputer = this._getPropertyComputer(change.key);
					propValue = propComputer.computeValueFromChanges(change.arg, initValue[change.key]);
				} else if (change.type === 'set') {
					propValue = change.value;
				}
				newValue[change.key] = propValue;
			}.bind(this));
			return newValue;
		},

		computeValueFromSet: function(arg, initValue) {
			return this.computeValueFromChanges(this.computeChangesFromSet(arg, initValue), initValue);
		},

		_getPropertyComputer: function(propId) {
			return this._propertyComputers[propId];
		}
	});
});