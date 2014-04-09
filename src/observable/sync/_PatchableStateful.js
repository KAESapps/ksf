define([
	'compose',
	'./_Stateful'
], function(
	compose,
	Stateful
){
	var generator = function(args) {
		var	PATCH = args.patch || 'patch';


		var Trait = compose(Stateful, {
			_applyChanges: function(arg, computeChangesFn) {
				var self = this,
					value = this.value();
				var changes = computeChangesFn(arg, value);
				var newValue = self._computer.computeValueFromChanges(changes, value);
				Stateful.prototype._setValue.call(this, newValue);
				if (changes.length > 0) {
					self._emit('changes', changes);
				}
			},
			_setValue: function(arg) {
				return this._applyChanges(arg, this._computer.computeChangesFromSet.bind(this._computer));
			},
		});
		Trait.prototype[PATCH] = function(patch) {
			return this._applyChanges(patch, this._computer.computeChangesFromPatch.bind(this._computer));
		};

		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});