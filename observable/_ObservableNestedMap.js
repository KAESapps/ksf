define([
	'compose',
	'./_Composite',
	'./accessors/PropertyAccessor',
	'./accessors/PropertySchemaAccessor',
	'lodash/objects/clone'
], function(
	compose,
	_Composite,
	PropertyAccessor,
	PropertySchemaAccessor,
	clone
){
	var normalizeByStructure = function(obj, structure) {
		var normalizedValue;
		if (structure.properties) {
			normalizedValue = {};
			Object.keys(structure.properties).forEach(function(prop) {
				if (prop in obj) {
					normalizedValue[prop] = normalizeByStructure(obj[prop], structure.properties[prop]);
				}
			});
		} else {
			normalizedValue = obj;
		}
		return normalizedValue;
	};
	var patchByStructure = function(source, patch, structure) {
		var patchedValue;
		if (structure.properties) {
			patchedValue = clone(source);
			Object.keys(structure.properties).forEach(function(prop) {
				if (prop in patch) {
					patchedValue[prop] = patchByStructure(source[prop], patch[prop], structure.properties[prop]);
				}
			});
		} else {
			patchedValue = patch;
		}
		return patchedValue;
	};

	return compose(_Composite, function() {
		this._structure = {};
		this._accessors = {};
	}, {
		_setStructure: function(structure) {
			this._structure = structure;
		},
		_normalizeSetValue: function(value) {
			value = value || {};
			return normalizeByStructure(value, this._structure);
		},
		set: function(value) {
			this._set(this._normalizeSetValue(value));
		},
		patch: function(patch) {
			this.set(patchByStructure(this.get(), patch, this._structure));
		},
		getProperty: function(propName) {
			var accessor;
			if (propName in this._accessors) {
				accessor = this._properties[propName];
			} else {
				var subSchema = this._structure.properties[propName];
				if (subSchema.properties) {
					accessor = new PropertySchemaAccessor(propName, subSchema);
				} else {
					accessor = new PropertyAccessor(propName);
				}
				this._addAccessor(accessor);
				this._accessors[propName] = accessor;
			}
			return accessor;
		}
	});
});