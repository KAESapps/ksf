define([
	'compose',
	'./PatchableStateful',
], function(
	compose,
	PatchableStateful,
){

	var Dict = compose(PatchableStateful, {
		_computeValueFromPatch: function(patchArg) {
			var value = this._value;

		},
		prop: function(propName) {
			return new PropertyAccessor(this, propName);
		},
		add: function(propName, initValue) {
			return this.patch({});
		},
		remove: function(propName) {
			return this.patch({});
		},
		set: function(propName, value) {
			return this.patch({});
		},
	});
});