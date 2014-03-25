define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose(function() {
		this._indexAccessors = [];
	}, {
		_indexAccessorFactory: null,
		getIndexedAccessor: function(index) {
			var accessor;
			if (index in this.getValue()) {
				if (index in this._indexAccessors) {
					accessor = this._indexAccessors[index];
				} else {
					accessor = this._indexAccessorFactory(this);
					this._indexAccessors[index] = accessor;
				}
			} else {
				throw "Index not found";
			}
			return accessor;
		},
		getIndexedAccessorIndex: function(accessor) {
			return this._indexAccessors.indexOf(accessor);
		},

		add: function(value, index) {
			index = this.getValue().length;
			
			var changes = this.patchValue([{
				type: 'added',
				index: index,
				value: value
			}]);
			return this.getIndexedAccessor(index);
		},
		remove: function(index) {
			this.patchValue([{
				type: 'removed',
				index: index
			}]);
			this._indexAccessors.splice(index, 1);
		},
	});
});