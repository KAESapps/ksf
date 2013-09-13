define([
	'bacon',
], function(
	Bacon
){
	// add some operands to bacon streams and properties



	// log facilty that does not subscribe to a stream (as the native .log do) but only log events and forward them
	// so it is more transparent than the native Observable#log operand that create a subscription
	Bacon.Observable.prototype.onEventLog = Bacon.Observable.prototype.log; // rename native log operand that is confusing
	Bacon.Observable.prototype.log = function(label){
		return this.doAction(console, 'log', label);
	};

	// stream operand that create a stream that emits when source stream emits AND when the emited value emits a "changed"
	Bacon.Observable.prototype.onChanged = function(){
		return this.flatMapLatest(function(value){
			return value && value.asReactive && value.asReactive() || Bacon.constant(value);
		}).toProperty();
	};
	// stream operand that create a stream that emits when source stream emits AND when the emited value emits a "changed" AND when one of its item emits a "changed"
	Bacon.Observable.prototype.onEach = function(){
		return this.onChanged()
			// on each change of "iterable" create a new stream that observes all current iterable
			.flatMapLatest(function(iterable){
				return iterable && iterable.map && Bacon.combineAsArray(iterable.map(function(item){
					return item.asReactive && item.asReactive() || Bacon.constant(item);
				}).toArray()).map(iterable) || Bacon.constant(iterable);
			}).toProperty();
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


});