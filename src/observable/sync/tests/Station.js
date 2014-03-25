define([
	'compose',
	'../propertyObject/_StatefulPropertyObject',
	'../propertyObject/_Accessor',
	'../propertyObject/_Computer',
	'../propertyObject/PropertyAccessor',
	'../propertyObject/_CompositePropertyAccessor',
	'../array/_Computer',
	'../array/_Accessor',
	'../array/_CompositeIndexedAccessor',
], function(
	compose,
	_StatefulPropertyObject,
	_PropObjAccessor,
	_PropObjComputer,
	PropertyAccessor,
	_CompositePropertyAccessor,
	_ArrayComputer,
	_ArrayAccessor,
	_CompositeIndexedAccessor
){
	var Noop = compose({
		computeValueFromSet: function(arg) {
			return arg;
		}
	});

	var EnumComputer = compose(function(values) {
		this.values = values;
	}, {
		computeValueFromSet: function(value) {
			if (this.values.indexOf(value) < 0) {
				return undefined;
			}
			return value;
		}
	});

	var DefaultEmptyString = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'string' ? arg : '';
		}
	});

	var IntegerComputer = compose({
		computeValueFromSet: function(arg) {
			return typeof(arg) === 'number' ? arg : undefined;
		}
	});

	var ArbreItem = compose(_PropObjComputer, {
		_properties: {
			essence: new EnumComputer([
				"Chêne",
				"Frêne"
			]),
			circonference: new IntegerComputer(),
		}
	});

	var ArbreList = compose(_ArrayComputer, {
		_itemComputer: new ArbreItem()
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
	var MapAccessor = compose(_CompositeIndexedAccessor, _PropObjAccessor, {
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

	var ArrayOfMapPropertyAccessor = compose(_CompositePropertyAccessor, _ArrayAccessor, {
		_indexAccessorFactory: MapAccessor
	}, function() {
		var self = this;
		this.API = {
			get: function() { return self.getValue(); },
			set: function(arg) { return self.setValue(arg); },
			add: function(arg) { return self.add(arg).API; },
			remove: function(arg) { return self.remove(arg); },
			onValue: function(listener) { return self.onValue(listener); },
			onChanges: function(listener) { return self.onChanges(listener); },
			destroy: function() { return self.destroy(); }
		};
	});

	return compose(function() {
		this._propObj = compose.create(_StatefulPropertyObject, {
			_properties: {
				nom: {
					computer: new DefaultEmptyString(),
					accessorFactory: BasicPropertyAccessor
				},
				position: {
					computer: new Noop(),
					accessorFactory: BasicPropertyAccessor
				},
				arbres: {
					computer: new ArbreList(),
					accessorFactory: ArrayOfMapPropertyAccessor
				}
			},
			_getPropertyComputer: function(propId) {
				return this._properties[propId].computer;
			},
			_createPropertyAccessor: function(id) {
				return this._properties[id].accessorFactory(this, id);
			},
		});
	}, {
		get: function() { return this._propObj.getValue(); },
		set: function(arg) { return this._propObj.setValue(arg); },
		onValue: function(listener) { return this._propObj.onValue(listener); },
		onChanges: function(listener) { return this._propObj.onChanges(listener); },
		destroy: function() { return this._propObj.destroy(); },

		getProperty: function(propId) {
			var acc = this._propObj.getPropertyAccessor(propId);
			return acc.API;
		},
	});
});