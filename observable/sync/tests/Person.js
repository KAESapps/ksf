define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_WithComputedProperties',
	'../propertyObject/PropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	_WithComputedProperties,
	PropertyAccessor
){
	var DefaultEmptyString = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var StringComputer = compose(function(fct) {
		this.computeValueFromDeps = fct;
	});

	var PersonPropObj = compose(_StatefulPropertyObject, _WithComputedProperties, {
		_properties: {
			firstName: new DefaultEmptyString(),
			lastName: new DefaultEmptyString()
		},
		computedProperties: {
			fullName: {
				computer: new StringComputer(function(firstName, lastName) {
					return (firstName + ' ' + lastName).trim();
				}),
				deps: ['firstName', 'lastName']
			}
		},
		_accessorFactories: {
			firstName: PropertyAccessor,
			lastName: PropertyAccessor,
			fullName: PropertyAccessor
		}
	});

	return compose(function() {
		this._propObj = new PersonPropObj();
	}, {
		get: function() { return this._propObj.getValue(); },
		set: function(arg) { return this._propObj.setValue(arg); },
		onValue: function(listener) { return this._propObj.onValue(listener); },
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