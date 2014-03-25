define([
	'compose'
], function(
	compose
){
	return compose({
		_createPropertyAccessor: function(id) {
			return this._accessorFactories[id](this, id);
		},
		prop: function(id) {
			var accessor = this.own(this._createPropertyAccessor(id));
			return accessor;
		},
	});
});