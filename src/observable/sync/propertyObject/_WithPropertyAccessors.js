define([
	'compose'
], function(
	compose
){
	return compose({
		_createPropertyAccessor: function(id) {
			return new (this._accessorFactories[id])(this, id);
		},
		prop: function(id) {
			var accessor = this._createPropertyAccessor(id);
			return accessor;
		},
	});
});