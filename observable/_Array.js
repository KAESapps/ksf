define([
	'compose',
	'./_Composite',
	'lodash/objects/clone'
], function(
	compose,
	_Composite,
	clone
){
	return compose(_Composite, function() {
		this._accessors = [];
	}, {
		_itemProperty: null,
		_computeStateFromSet: function(arg) {
			arg = arg || [];
			var self = this;

			// destroy all item accessors
			this._accessors.forEach(function(accessor) {
				self._removeAccessor(accessor);
			});
			this._accessors = [];

			return arg.map(function(item) {
				return self._itemProperty.compute(item);
			});
		},
		/*
			@param: arrayChanges
				example:
				[{
					type: 'add',
					index: 0,
					value: 'toto'
				}, {
					type: 'remove',
					index: 1
				}]
		*/
		_computeStateFromPatch: function(arrayChanges) {
			var self = this;
			var state = clone(this.get());
			arrayChanges.forEach(function(change) {
				if (change.type === 'add') {
					state.push(self._itemProperty.compute(change.value));
				} else if (change.type === 'remove') {
					state.splice(change.index, 1);
				} else if (change.type === 'set') {
					state[change.index] = self._itemProperty.compute(change.value);
				} else {
					throw "Bad change format";
				}
			});
			return state;
		},
		_getAccessor: function(index) {
			var accessor;
			if (index in this.get()) {
				if (index in this._accessors) {
					accessor = this._accessors[index];
				} else {
					accessor = this._itemProperty.accessorFactory();
					this._addAccessor(accessor);
					this._accessors[index] = accessor;
				}
			} else {
				throw "Index not found";
			}
			return accessor;
		},
		add: function(value, index) {
			index = this.get().length;
			
			var changes = this.patch([{
				type: 'add',
				index: index,
				value: value
			}]);
			return this._getAccessor(index);
		},
		remove: function(index) {
			this.patch([{
				type: 'remove',
				index: index
			}]);
			var accessor = this._accessors[index];
			this._removeAccessor(accessor);
			this._accessors.splice(index, 1);
		},
		getIndex: function(accessor) {
			return this._accessors.indexOf(accessor);
		}
	});
});