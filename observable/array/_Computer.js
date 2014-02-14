define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose({
		_itemComputer: null,

		_computeValueFromSet: function(arg) {
			arg = arg || [];
			var self = this;

			return arg.map(function(item) {
				return self._itemComputer._computeValueFromSet(item);
			});
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
		_computeValueFromPatch: function(value, arrayChanges) {
			var self = this;
			var state = clone(value);
			arrayChanges.forEach(function(change) {
				if (change.type === 'added') {
					var newItem = self._itemComputer._computeValueFromSet(change.value);
					state.push(newItem);
					change.value = newItem;
				} else if (change.type === 'removed') {
					state.splice(change.index, 1);
				} else if (change.type === 'set') {
					state[change.index] = self._itemComputer._computeValueFromSet(change.value);
				} else if (change.type === 'patched') {
					state[change.index] = self._itemComputer._computeValueFromPatch(value[change.index], change.arg);
				} else {
					throw "Bad change format";
				}
			});
			return state;
		}
	});
});