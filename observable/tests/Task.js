define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/PropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	PropertyAccessor
) {
	return compose(function() {
		this._propObj = compose.create(_StatefulPropertyObject, {
			_properties: {
				label: {
					computeValueFromSet: function(arg) {
						return typeof(arg) === 'string' ? arg : '';
					}
				},
				done: {
					computeValueFromSet: function(arg) {
						return typeof(arg) === 'boolean' ? arg : false;
					}
				}
			},
			_accessorFactories: {
				label: PropertyAccessor,
				done: PropertyAccessor,
			},
			computeChangesFromPatch: function(changes, initValue) {
				var tmpValue = this.computeValueFromChanges(changes, initValue);
				return changes.filter(function(item) {
					if (item.key !== 'label' || !tmpValue.done) {
						return true;
					}
				});
			}
		});
	}, {
		get: function() { return this._propObj.getValue(); },
		set: function(arg) { return this._propObj.setValue(arg); },
		patch: function(arg) { return this._propObj.patchValue(arg); },
		onValue: function(listener) { return this._propObj.onValue(listener); },
		onChanges: function(listener) { return this._propObj.onChanges(listener); },
		destroy: function() { return this._propObj.destroy(); },

		getProperty: function(propId) {
			var acc = this._propObj.getPropertyAccessor(propId);
			return {
				get: function() { return acc.getValue(); },
				set: function(arg) { return acc.setValue(arg); },
				onValue: function(listener) { return acc.onValue(listener); },
				destroy: function() { return acc.destroy(); }
			};
		},
	});
});