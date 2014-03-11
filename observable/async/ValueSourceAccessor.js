define([], function(){
	var generator = function(args) {
		var getValue = args.getValue || 'getValue',
			setValue = args.setValue || 'setValue',
			onValue = args.onValue || 'onValue';


		var Trait = function(valueSource) {
			this._source = valueSource;
		};
		Trait.prototype[getValue] = function() {
			return this._source.getValue();
		};
		Trait.prototype[setValue] = function(value) {
			return this._source.setValue(value);
		};
		Trait.prototype[onValue] = function(listener) {
			return this._source.onValue(listener);
		};


		return Trait;
	};

	var Trait = generator({});
	Trait.custom = generator;
	return Trait;
});