define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	var generator = function(args) {
		var PARENT = args.parent || '_parent',
			PROPNAME = args.propName || '_propName',
			GETVALUE = args.getValue || 'getValue',
			SETVALUE = args.setValue || 'setValue',
			ONVALUE = args.onValue || 'onValue',
			PARENT_GETVALUE = args.parentGetValue || 'getValue',
			PARENT_PATCHVALUE = args.parentPatchValue || 'patchValue',
			PARENT_ONVALUE = args.parentOnValue || 'onValue';

		var Trait = compose(Destroyable, function(parent, propName) {
			this[PARENT] = parent;
			this[PROPNAME] = propName;
		});
		Trait.prototype[GETVALUE] = function() {
			if (this._destroyed) { throw "Destroyed"; }
			var parentValue = this[PARENT][PARENT_GETVALUE]();
			return parentValue && parentValue[this[PROPNAME]];
		};

		Trait.prototype[SETVALUE] = function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			this[PARENT][PARENT_PATCHVALUE]([{
				type: 'set',
				key: this[PROPNAME],
				value: arg
			}]);
		};

		Trait.prototype[ONVALUE] = function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this[PARENT][PARENT_ONVALUE](function() {
				listener(self[GETVALUE]());
			}));
		};
		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});