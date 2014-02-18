define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose({
		_itemComputer: null,

		_computeChangesFromSet: function(initValue, arg) {
			arg = arg || [];
			initValue = initValue || [];

			var self = this;
			var changes = initValue.map(function(oldItem) {
				return {
					type: 'removed',
					index: 0
				};
			});
			arg.forEach(function(item, index) {
				changes.push({
					type: 'added',
					index: index,
					value: item
				});
			});
			return this._computeChangesFromPatch(initValue, changes);
		},
		_computeChangesFromPatch: function(value, arrayChanges) {
			value = value || [];
			arrayChanges = arrayChanges || [];

			var self = this;
			arrayChanges.forEach(function(change) {
				if (change.type === 'added') {
					change.value = self._itemComputer._computeValueFromSet(change.value, undefined);
				} else if (change.type === 'set') {
					change.value = self._itemComputer._computeValueFromSet(change.value, value[change.index]);
				} else if (change.type === 'patched') {
					change.arg = self._itemComputer._computeChangesFromPatch(value[change.index], change.arg);
				}
			});
			return arrayChanges;
		},
		/*
			@param: arrayChanges
				example:
				[{
					type: 'added',
					index: 0,
					value: 'toto'
				}, {
					type: 'set',
					index: 1,
					value: 'tata'
				}, {
					type: 'removed',
					index: 2
				}, {
					type: 'patched',
					index: 3,
					arg: (...)
				}]
		*/
		_computeValueFromChanges: function(value, arrayChanges) {
			value = value || [];
			arrayChanges = arrayChanges || [];

			var self = this;
			var newValue = clone(value);
			arrayChanges.forEach(function(change) {
				if (change.type === 'added') {
					newValue.push(change.value);
				} else if (change.type === 'removed') {
					newValue.splice(change.index, 1);
				} else if (change.type === 'set') {
					newValue[change.index] = change.value;
				} else if (change.type === 'patched') {
					newValue[change.index] = self._itemComputer._computeValueFromChanges(value[change.index], change.arg);
				} else {
					throw "Bad change format";
				}
			});
			return newValue;
		},

		_computeValueFromSet: function(arg, initValue) {
			return this._computeValueFromChanges(initValue, this._computeChangesFromSet(initValue, arg));
		},
	});
});