define([
	'compose',
	'./StoreBase',
	'../propertyObject/CompositePropertyAccessor',
	'../propertyObject/PropertyAccessor',
	'./StoreComputer'
], function(
	compose,
	StoreBase,
	CompositePropertyAccessor,
	PropertyAccessor,
	StoreComputer
){
	var documentComputer = {
		computeChangesFromSet: function(arg, initValue) {
			arg = arg || {};
			initValue = initValue || {};

			var changes = [],
				self = this;
			
			Object.keys(arg).forEach(function(propId) {
				var propComputer = self._propertyComputer;
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
				var propComputer = this._propertyComputer;
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
			var newValue = initValue;
			propChanges.forEach(function(change) {
				var propValue;
				if (change.type === 'patched') {
					var propComputer = this._propertyComputer;
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

		_propertyComputer: {
			computeValueFromSet: function(arg) {
				return arg;
			}
		}
	};

	return compose(StoreBase, {
		_computer: new StoreComputer(documentComputer),
		_itemAccessorFactory: compose(CompositePropertyAccessor, {
			prop: function(prop) {
				return new PropertyAccessor(this, prop);
			},
			delete: function() {
				this._parent.remove(this._propName);
			}
		})
	});
});