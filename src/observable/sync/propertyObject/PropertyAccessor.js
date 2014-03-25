define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	var generator = function(args) {
		var getValue = args.getValue || 'get',
			setValue = args.setValue || 'set',
			parentGetValue = args.parentGetValue || 'get',
			parentPatchvalue = args.parentPatchValue || 'patchValue';

		var Trait = compose(Destroyable, function(parent, propName) {
			this._parent = parent;
			this._propName = propName;
		});

		Trait.prototype._extractValue = function(parentValue) {
			return parentValue && parentValue[this._propName];
		};

		Trait.prototype[getValue] = function() {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this,
				parentValue = this._parent[parentGetValue]();
			return self._extractValue(parentValue);
		};

		Trait.prototype[setValue] = function(arg) {
			if (this._destroyed) { throw "Destroyed"; }
			return this._parent[parentPatchvalue]([{
				type: 'set',
				key: this._propName,
				value: arg
			}]);
		};

		Trait.prototype._onValue = function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent.on('value', function(parentValue) {
				listener(self._extractValue(parentValue));
			}));
		};

		Trait.prototype.on = function(event, listener) {
			if (event === 'value') {
				return this._onValue(listener);
			}
		};
		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});