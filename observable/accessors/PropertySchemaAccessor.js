define([
	'compose',
	'./PropertyAccessor'
], function(
	compose,
	PropertyAccessor
){
	var PropertySchemaAccessor = compose(PropertyAccessor, function(propName, schema) {
		this._propName = propName;
		this._schema = schema;
	}, {
		patch: function(obj) {
			if (this._destroyed) { throw "Destroyed"; }
			var result = this.get();
			Object.keys(obj).forEach(function(key) {
				result[key] = obj[key];
			});
			this._parent.patch(result);
		},
		getProperty: function(propName) {
			var accessor;
			var subSchema = this._schema.properties[propName];
			if (subSchema.properties) {
				accessor = new PropertySchemaAccessor(propName, subSchema);
			} else {
				accessor = new PropertyAccessor(propName);
			}
			this._addAccessor(accessor);
			return accessor;
		},
		_addAccessor: function(accessor) {
			this.own(accessor);
			accessor.setParent(this);
		},
		_removeAccessor: function(accessor) {
			accessor.destroy();
		}
	});
	return PropertySchemaAccessor;
});