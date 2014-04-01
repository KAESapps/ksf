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
			PARENT_PATCHVALUE = args.parentPatchValue || 'patch';

		return compose(PropertyAccessor.custom({
			parent: PARENT,
			propName: PROPNAME,
			getValue: args.getValue,
			parentGetValue: args.parentGetValue,
			parentPatchValue: PARENT_PATCHVALUE,
		}), {
			patch: function(arg) {
				if (this._destroyed) { throw "Destroyed"; }
				return this[PARENT][PARENT_PATCHVALUE]([{
					type: 'patched',
					key: this[PROPNAME],
					arg: arg
				}]);
			},

			_onChanges: function(listener) {
				if (this._destroyed) { throw "Destroyed"; }
				var self = this;
				return this.own(this[PARENT].on('changes', function(changes) {
					var selfChanges = self._getChanges(changes);
					if (selfChanges && selfChanges.length > 0) {
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

			on: function(event, listener) {
				if (event === 'value') {
					return this._onValue(listener);
				} else if (event === 'changes') {
					return this._onChanges(listener);
				} else {
					throw "Bad event name: " + event;
				}
			}
		});
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});