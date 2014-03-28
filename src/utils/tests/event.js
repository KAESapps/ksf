define([
	'intern!object',
	'intern/chai!assert',
	'../event',
], function(
	registerSuite,
	assert,
	event
) {

	var o;

	registerSuite({
		beforeEach : function() {
			o = {};
			o.onValue = event();
		},
		"emit without listener": function(){
			o.onValue.emit("hello");
		},
		"one listener": function(){
			var observedEvents = [];
			o.onValue(function(ev){
				observedEvents.push(ev);
			});
			o.onValue.emit("hello");
			assert.deepEqual(observedEvents, [
				"hello",
			]);
		},
		"many listeners": function(){
			var observedEvents1 = [];
			var observedEvents2 = [];
			o.onValue(function(ev){
				observedEvents1.push(ev);
			});
			o.onValue(function(ev){
				observedEvents2.push(ev);
			});
			o.onValue.emit("hello");
			assert.deepEqual(observedEvents1, [
				"hello",
			]);
			assert.deepEqual(observedEvents2, [
				"hello",
			]);
		},
		"remove one listener from many": function() {
			var observedEvents1 = [];
			var observedEvents2 = [];
			var canceler1 = o.onValue(function(ev){
				observedEvents1.push(ev);
			});
			o.onValue(function(ev){
				observedEvents2.push(ev);
			});
			canceler1();
			o.onValue.emit("hello");
			assert.deepEqual(observedEvents1, [
			]);
			assert.deepEqual(observedEvents2, [
				"hello",
			]);
		},
	});

});