define([
	'compose',
	'lodash/objects/clone'
], function(
	compose,
	clone
){
	return compose(function(itemComputer) {
		this._itemComputer = itemComputer;
	}, {
		computeChangesFromSet: function(arg, initValue) {
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
			return this.computeChangesFromPatch(changes, initValue);
		},
		computeChangesFromPatch: function(arrayChanges, value) {
			value = value || [];
			arrayChanges = arrayChanges || [];

			var self = this;
			arrayChanges.forEach(function(change) {
				if (change.type === 'added') {
					change.value = self._itemComputer.computeValueFromSet(change.value, undefined);
				} else if (change.type === 'set') {
					change.value = self._itemComputer.computeValueFromSet(change.value, value[change.index]);
				} else if (change.type === 'patched') {
					change.arg = self._itemComputer.computeChangesFromPatch(change.arg, value[change.index]);
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
		computeValueFromChanges: function(arrayChanges, value) {
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
					newValue[change.index] = self._itemComputer.computeValueFromChanges(change.arg, value[change.index]);
				} else {
					throw "Bad change format";
				}
			});
			return newValue;
		},

		computeValueFromSet: function(arg, initValue) {
			return this.computeValueFromChanges(this.computeChangesFromSet(arg, initValue), initValue);
		},
	});
});