define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose({
		_computeValueFromSet: function(arg) {
			arg = arg || {};
			var newValue = {},
				self = this;
			Object.keys(this._properties).forEach(function(propId) {
				var propValue = self._getPropertyComputer(propId)._computeValueFromSet(arg[propId]);
				newValue[propId] = propValue;
			});

			return newValue;
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
		_computeValueFromPatch: function(initValue, propChanges) {
			propChanges = propChanges || [];
			var newValue = clone(initValue);
			propChanges.forEach(function(change) {
				var propValue,
					propComputer = this._getPropertyComputer(change.key);
				if (change.type === 'patched') {
					propValue = propComputer._computeValueFromPatch(initValue[change.key], change.arg);
				} else if (change.type === 'set') {
					propValue = propComputer._computeValueFromSet(change.value);
				}
				newValue[change.key] = propValue;
			}.bind(this));
			return newValue;
		},
		_getPropertyComputer: function(propId) {
			return this._properties[propId];
		}
	});
});