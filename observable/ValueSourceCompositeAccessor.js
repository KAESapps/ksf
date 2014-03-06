define([
	'./ValueSourceAccessor',
	'dojo/Deferred',
	'ksf/base/Evented',
], function(
	Accessor,
	Deferred,
	Evented
){
	/*
	 * Accessor using an observable value source (onValue) for storing a composite value
	 * thus generating changes itself (onChanges)
	 */
	var generator = function(args) {
		var getValue = args.getValue || 'getValue',
			setValue = args.setValue || 'setValue',
			patchValue = args.patchValue || 'patchValue',
			onValue = args.onValue || 'onValue',
			onChanges = args.onChanges || 'onChanges';

		var CustomAccessor = Accessor.custom({
			getValue: getValue,
			setValue: '_applyValue',
			onValue: onValue
		});


		var Trait = function(valueSource, changesComputer) {
			CustomAccessor.apply(this, arguments);
			this._computer = changesComputer;
		};
		Trait.prototype = new CustomAccessor();
		Trait.prototype._emit = Evented.prototype._emit;
		Trait.prototype._on = Evented.prototype.on;

		Trait.prototype._applyChanges = function(arg, computeChangesFn) {
			var self = this;
			return this[getValue]().then(function(value) {
				var changes = computeChangesFn(arg, value);
				var newValue = self._computer.computeValueFromChanges(changes, value);
				return self._applyValue(newValue).then(function() {
					return self._emit('changes', changes);
				});
			});
		};
		Trait.prototype[setValue] = function(arg) {
			return this._applyChanges(arg, this._computer.computeChangesFromSet.bind(this._computer));
		};
		Trait.prototype[patchValue] = function(patch) {
			return this._applyChanges(patch, this._computer.computeChangesFromPatch.bind(this._computer));
		};
		Trait.prototype[onChanges] = function(listener) {
			return this.own(this._on('changes', function(changes) {
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