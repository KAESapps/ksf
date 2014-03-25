define([
	'./Accessor'
], function(
	Accessor
){
	var generator = function(args) {
		var getValue = args.getValue || 'getValue',
			setValue = args.setValue || 'setValue',
			patchValue = args.patchValue || 'patchValue',
			onValue = args.onValue || 'onValue',
			onChanges = args.onChanges || 'onChanges';

		var CustomAccessor = Accessor.custom({
			getValue: getValue,
			setValue: setValue,
			onValue: onValue
		});


		var Trait = function(compositeValueSource) {
			CustomAccessor.apply(this, arguments);
		};
		Trait.prototype = new CustomAccessor();
		Trait.prototype[patchValue] = function(changes) {
			return this._source.patchValue(changes);
		};
		Trait.prototype[onChanges] = function(listener) {
			return this._source.onChanges(listener);
		};


		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});