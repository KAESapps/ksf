define([
	'compose',
	'./_Stateful'
], function(
	compose,
	_Stateful
){
	var generator = function(args) {
		var GETVALUE = args.getValue || 'getValue',
			SETVALUE = args.setValue || 'setValue';

		var Trait = compose(_Stateful.custom({
			getValue: GETVALUE,
			setValue: SETVALUE,
			onValue: args.onValue
		}), {
			computeValueFromChanges: function(arg, initValue) {},
			_applyChanges: function(changes) {
				this._writeValue(this.computeValueFromChanges(changes, this[GETVALUE]()));
				this._emit('changes', changes);
				return changes;
			},
			
			onChanges: function(listener) {
				return this.on('changes', function(changes) {
					if (changes.length > 0) {
						listener(changes);
					}
				});
			},
			
			computeChangesFromPatch: function(arg, initValue) { return arg; },
			patchValue: function(patch) {
				return this._applyChanges(this.computeChangesFromPatch(patch, this[GETVALUE]()));
			},
			
			computeChangesFromSet: function(arg, initValue) {},
		});

		Trait.prototype[SETVALUE] = function(arg) {
			return this._applyChanges(this.computeChangesFromSet(arg, this[GETVALUE]()));
		};
		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});