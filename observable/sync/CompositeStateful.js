define([
	'compose',
	'./Stateful'
], function(
	compose,
	Stateful
){
	var generator = function(args) {
		var getValue = args.getValue || 'getValue',
			setValue = args.setValue || 'setValue',
			patchValue = args.patchValue || 'patchValue',
			onValue = args.onValue || 'onValue',
			onChanges = args.onChanges || 'onChanges';

		var CustomStateful = Stateful.custom({
			getValue: getValue,
			setValue: '_applyValue',
			onValue: onValue
		});


		var Trait = compose(CustomStateful.prototype, function(changesComputer) {
			this._computer = changesComputer;
			CustomStateful.call(this);
		});

		Trait.prototype._applyChanges = function(arg, computeChangesFn) {
			var self = this,
				value = this[getValue]();
			var changes = computeChangesFn(arg, value);
			var newValue = self._computer.computeValueFromChanges(changes, value);
			self._applyValue(newValue);
			self._emit('changes', changes);
		};
		Trait.prototype[setValue] = function(arg) {
			return this._applyChanges(arg, this._computer.computeChangesFromSet.bind(this._computer));
		};
		Trait.prototype[patchValue] = function(patch) {
			return this._applyChanges(patch, this._computer.computeChangesFromPatch.bind(this._computer));
		};
		Trait.prototype[onChanges] = function(listener) {
			return this.own(this.on('changes', function(changes) {
				if (changes.length > 0) {
					listener(changes);
				}
			}));
		};

		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});