define([
	'compose'
], function(
	compose
){
	return compose(function(itemComputer) {
		this._itemComputer = itemComputer;
	}, {
		computeChangesFromSet: function(arg, initValue) {
			arg = arg || {};
			initValue = initValue || {};

			var changes = [],
				self = this;

			Object.keys(arg).forEach(function(propId) {
				var propComputer = self._getPropertyComputer(propId),
					propValue;
				if (propComputer.computeChangesFromSet) {
					changes.push({
						type: 'patched',
						key: propId,
						arg: propComputer.computeChangesFromSet(arg[propId], initValue[propId])
					});
				} else {
					changes.push({
						type: 'set',
						key: propId,
						value: propComputer.computeValueFromSet(arg[propId], initValue[propId])
					});
				}
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
				} else if (change.type === 'added') {
					change.value = propComputer.computeValueFromSet(change.value, initValue[change.key]);
				}
			}.bind(this));
			return propChanges;
		},
		computeValueFromChanges: function(propChanges, initValue) {
			propChanges = propChanges || [];
			initValue = initValue || {};
			var newValue = initValue;
			propChanges.forEach(function(change) {
				var propValue;
				if (change.type === 'removed') {
					delete newValue[change.key];
				} else {
					if (change.type === 'patched') {
						var propComputer = this._getPropertyComputer(change.key);
						propValue = propComputer.computeValueFromChanges(change.arg, initValue[change.key]);
					} else if (change.type === 'set') {
						propValue = change.value;
					} else if (change.type === 'added') {
						propValue = change.value;
					}
					newValue[change.key] = propValue;
				}
			}.bind(this));
			return newValue;
		},

		computeValueFromSet: function(arg, initValue) {
			return this.computeValueFromChanges(this.computeChangesFromSet(arg, initValue), initValue);
		},

		_getPropertyComputer: function(propId) {
			return this._itemComputer;
		}
	});
});