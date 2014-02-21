define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_Accessor',
	'../propertyObject/_Computer',
	'../propertyObject/PropertyAccessor',
	'../propertyObject/_CompositePropertyAccessor'
], function(
	compose,
	_StatefulPropertyObject,
	_PropObjAccessor,
	_PropObjComputer,
	PropertyAccessor,
	_CompositePropertyAccessor
){
	var DefaultEmptyString = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var AddressComputer = compose(_PropObjComputer, {
		_properties: {
			city: new DefaultEmptyString(),
			street: new DefaultEmptyString(),
		}
	});

	var BasicPropertyAccessor = compose(PropertyAccessor, function() {
		var acc = this;
		this.API = {
			get: function() { return acc.getValue(); },
			set: function(arg) { return acc.setValue(arg); },
			onValue: function(listener) { return acc.onValue(listener); },
			destroy: function() { return acc.destroy(); }
		};
	});
	var MapPropertyAccessor = compose(_CompositePropertyAccessor, _PropObjAccessor, {
		_createPropertyAccessor: function(id) {
			return new BasicPropertyAccessor(this, id);
		},
	}, function() {
		var self = this;
		this.API = {
			get: function() { return self.getValue(); },
			set: function(arg) { return self.setValue(arg); },
			onValue: function(listener) { return self.onValue(listener); },
			destroy: function() { return self.destroy(); },
			getProperty: function(propId) {
				var acc = self.getPropertyAccessor(propId);
				return acc.API;
			},
		};
	});

	return compose(function() {
		this._propObj = compose.create(_StatefulPropertyObject, {
			_properties: {
				firstName: new DefaultEmptyString(),
				lastName: new DefaultEmptyString(),
				address: new AddressComputer()
			},
			_accessorFactories: {
				firstName: BasicPropertyAccessor,
				lastName: BasicPropertyAccessor,
				address: MapPropertyAccessor
			}
		});
	}, {
		get: function() { return this._propObj.getValue(); },
		set: function(arg) { return this._propObj.setValue(arg); },
		onValue: function(listener) { return this._propObj.onValue(listener); },
		destroy: function() { return this._propObj.destroy(); },

		getProperty: function(propId) {
			var acc = this._propObj.getPropertyAccessor(propId);
			return acc.API;
		},
	});
});