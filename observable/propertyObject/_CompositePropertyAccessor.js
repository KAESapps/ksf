define([
	'compose',
	'./PropertyAccessor'
], function(
	compose,
	PropertyAccessor
){
	var generator = function(args) {
		var PARENT = args.parent || '_parent',
			PROPNAME = args.propName || '_propName',
			PARENT_PATCHVALUE = args.parentPatchValue || 'patchValue',
			PARENT_ONCHANGES = args.parentOnChanges || 'onChanges';

		return compose(PropertyAccessor.custom({
			parent: PARENT,
			propName: PROPNAME,
			getValue: args.getValue,
			parentGetValue: args.parentGetValue,
			parentPatchValue: PARENT_PATCHVALUE,
			parentOnValue: args.parentOnValue
		}), {
			patchValue: function(arg) {
				if (this._destroyed) { throw "Destroyed"; }
				this[PARENT][PARENT_PATCHVALUE]([{
					type: 'patched',
					key: this[PROPNAME],
					arg: arg
				}]);
			},

			onChanges: function(listener) {
				if (this._destroyed) { throw "Destroyed"; }
				var self = this;
				return this.own(this[PARENT][PARENT_ONCHANGES](function(changes) {
					var selfChanges = self._getChanges(changes);
					if (selfChanges.length > 0) {
						listener(selfChanges);
					}
				}));
			},

			_getChanges: function(parentChanges) {
				var propName = this[PROPNAME];
				return parentChanges.filter(function(item) {
					return item.type === 'patched' && item.key === propName;
				}).map(function(item) {
					return item.arg;
				})[0];
			},
		});
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});