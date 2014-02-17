define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/BasicPropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	BasicPropertyAccessor
) {
	return compose(_StatefulPropertyObject, {
		_properties: {
			label: {
				_computeValueFromSet: function(arg) {
					return typeof(arg) === 'string' ? arg : '';
				}
			},
			done: {
				_computeValueFromSet: function(arg) {
					return typeof(arg) === 'boolean' ? arg : false;
				}
			}
		},
		_accessorFactories: {
			label: BasicPropertyAccessor,
			done: BasicPropertyAccessor,
		}
	}, {
		_applyLockedLabel: function(oldValue, newValue) {
			if (oldValue && oldValue.done && newValue.done) {
				newValue.label = oldValue.label;
			}
			return newValue;
		},
		_computeValueFromSet: function(arg) {
			var newValue = _StatefulPropertyObject.prototype._computeValueFromSet.call(this, arg);
			return this._applyLockedLabel(this._getValue(), newValue);
		},
		_computeValueFromPatch: function(initValue, propChanges) {
			var newValue = _StatefulPropertyObject.prototype._computeValueFromPatch.call(this, initValue, propChanges);
			return this._applyLockedLabel(initValue, newValue);
		},
	});
});