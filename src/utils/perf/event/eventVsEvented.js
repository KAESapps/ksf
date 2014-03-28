define([
	'compose',
	'../../event',
	'ksf/base/Evented',
], function(
	compose,
	event,
	Evented
){
	var ObservableWithEvent = compose(function() {
		this.onValue = event();
		this.onChanges = event();
		this.onKeys = event();
	});
	var ObservableWithEvented = compose(Evented);

	JSLitmus.test('event create instance', function() {
		var observable = new ObservableWithEvent();
	});
	JSLitmus.test('Evented create instance', function() {
		var observable = new ObservableWithEvented();
	});




/*	JSLitmus.test('event full test', function() {
		// instanciate
		var observable = new ObservableWithEvent();
		// add observers
		var canceler1 = observable.onValue(function() {});
		var canceler2 = observable.onValue(function() {});
		observable.onValue(function() {});
		// emit events
		observable.onValue.emit("value");
		observable.onKeys.emit("keys");
		// remove observers
		canceler1();
		canceler2();
		// emit events
		observable.onValue.emit("value");
		observable.onKeys.emit("keys");
	});
	JSLitmus.test('Evented full test', function() {
		// instanciate
		var observable = new ObservableWithEvented();
		// add observers
		var canceler1 = observable.on('value', function() {});
		var canceler2 = observable.on('value', function() {});
		observable.on('value', function() {});
		// emit events
		observable._emit('value', "value");
		observable._emit('keys', "keys");
		// remove observers
		canceler1();
		canceler2();
		// emit events
		observable._emit('value', "value");
		observable._emit('keys', "keys");
	});
*/});