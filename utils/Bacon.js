define([
	'originalBacon',
], function(
	Bacon
){
	// add some operands to bacon streams and properties

	// stream operand that create a stream that emits when source stream emits AND when the emited value emits a "changed"
	Bacon.Observable.prototype.onChanged = function(){
		return this.flatMapLatest(function(value){
			return value && value.asReactive() || Bacon.constant(undefined);
		});
	};
	// stream operand that create a stream that emits when source stream emits AND when the emited value emits a "changed" AND when one of its item emits a "changed"
	Bacon.Observable.prototype.onEach = function(){
		return this.onChanged()
			// on each change of "iterable" create a new stream that observes all current iterable
			.flatMapLatest(function(iterable){
				return iterable && Bacon.combineAsArray(iterable.map(function(item){
					return item.asReactive();
				}).toArray()).map(iterable) || Bacon.constant(undefined);
			})
		;
	};

	// same as "flatMapLatest" but also pass the previous stream value to "f"
	// like Observable#diff the first call is passed the start value
	Bacon.Observable.prototype.flatMapLatestDiff = function(start, f){
		var old = start;
		return this.flatMapLatest(function(current){
			var observable = f(old, current);
			old = current;
			return observable;
		});
	};


	return Bacon;
});