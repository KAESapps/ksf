define([
	'compose',
	'ksf/base/Destroyable'
], function(
	compose,
	Destroyable
){
	var generator = function(args) {
		var getValue = args.getValue || '_getValue',
			setValue = args.setValue || '_setValue',
			parentGetValue = args.parentGetValue || 'value',
			parentPatchvalue = args.parentPatchValue || 'patch';

		var Trait = compose(Destroyable, function(parent, propName) {
			this._parent = parent;
			this._propName = propName;
		});

		Trait.prototype._extractValue = function(parentValue) {
			return parentValue && parentValue[this._propName];
		};
		Trait.prototype._extractChanges = function(parentChanges) {
			var propName = this._propName,
				changes;
			var found = parentChanges && parentChanges.some(function(change) {
				changes = change.arg;
				return change.key === propName;
			});
			return changes;
		};

		Trait.prototype.value = function(value) {
			if (arguments.length === 0) {
				return this._getValue();
			} else {
				return this._setValue(value);
			}
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
			return this.own(this._parent.on('changes', function(parentChanges) {
				var changes = self._extractChanges(parentChanges);
				changes && listener(self.value());
			}));
		};

		Trait.prototype._onChanges = function(listener) {
			if (this._destroyed) { throw "Destroyed"; }
			var self = this;
			return this.own(this._parent.on('changes', function(parentChanges) {
				var changes = self._extractChanges(parentChanges);
				changes && listener(changes);
			}));
		};

		Trait.prototype.on = function(event, listener) {
			if (event === 'value') {
				return this._onValue(listener);
			}
			if (event === 'changes') {
				return this._onChanges(listener);
			}
		};
		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});