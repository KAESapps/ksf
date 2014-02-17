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
		_computeChangesFromPatch: function(initValue, changes) {
			var tmpValue = this._computeValueFromChanges(initValue, changes);
			return changes.filter(function(item) {
				if (item.key !== 'label' || !tmpValue.done) {
					return true;
				}
			});
		}
	});
});