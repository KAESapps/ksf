define([
	'compose',
	'./_Composite',
	'./accessors/PropertyAccessor',
	'lodash/objects/clone'
], function(
	compose,
	_Composite,
	PropertyAccessor,
	clone
){
	return compose(_Composite, function() {
		this._properties = {};
	}, {
		_computeStateFromSet: function(arg) {
			arg = arg || {};
			var normalizedValue = {};

			Object.keys(this._properties).forEach(function(propName) {
				if (propName in arg) {
					normalizedValue[propName] = arg[propName];
				}
			});

			return normalizedValue;
		},
		_computeStateFromPatch: function(patchMap) {
			var result = clone(this.get());
			Object.keys(patchMap).forEach(function(key) {
				result[key] = patchMap[key];
			});
			return this._computeStateFromSet(result);
		},
		addProperty: function(propName, value) {
			var accessor = new PropertyAccessor(propName);
			this._addAccessor(accessor);
			this._properties[propName] = accessor;
			
			accessor.set(value);
			return accessor;
		},
		removeProperty: function(propName) {
			var accessor = this._properties[propName];
			this._removeAccessor(accessor);
			delete this._properties[propName];
			this.patch({});
		},
		getProperty: function(propName) {
			return (propName in this._properties) ? this._properties[propName] : this.addProperty(propName);
		}
	});
});