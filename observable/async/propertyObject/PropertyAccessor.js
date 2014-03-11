define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	var generator = function(args) {
		var getValue = args.getValue || 'getValue',
			setValue = args.setValue || 'setValue',
			onValue = args.onValue || 'onValue',
			parentGetValue = args.parentGetValue || 'getValue',
			parentPatchvalue = args.parentPatchValue || 'patchValue',
			parentOnValue = args.parentOnValue || 'onValue';

		var Trait = compose(Destroyable, function(parent, propName) {
			this._parent = parent;
			this._propName = propName;
		});

		Trait.prototype._extractValue = function(parentValue) {
			return parentValue && parentValue[this._propName];
		};

		Trait.prototype[getValue] = function() {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this._parent[parentGetValue]().then(function(parentValue) {
				return self._extractValue(parentValue);
			});
		};

		Trait.prototype[setValue] = function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent[parentPatchvalue]([{
				type: 'set',
				key: this._propName,
				value: arg
			}]);
		};

		Trait.prototype[onValue] = function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent[parentOnValue](function(parentValue) {
				listener(self._extractValue(parentValue));
			}));
		};
		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});