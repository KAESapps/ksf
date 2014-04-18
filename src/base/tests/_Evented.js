define([
	'intern!object',
	'intern/chai!assert',
	'../_Evented',
	'compose',
], function(
	registerSuite,
	assert,
	_Evented,
	compose
) {

	var o;
	var EventedObject = compose(_Evented);

	registerSuite({
		beforeEach : function() {

			o = new EventedObject();
		},
		"emit without listener": function(){
			o._emit('value', "hello");
		},
		"one listener": function(){
			var observedEvents = [];
			o.on('value', function(ev){
				observedEvents.push(ev);
			});
			o._emit('value', "hello");
			assert.deepEqual(observedEvents, [
				"hello",
			]);
		},
		"many listeners": function(){
			var observedEvents1 = [];
			var observedEvents2 = [];
			o.on('value', function(ev){
				observedEvents1.push(ev);
			});
			o.on('value', function(ev){
				observedEvents2.push(ev);
			});
			o._emit('value', "hello");
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
			var canceler1 = o.on('value', function(ev){
				observedEvents1.push(ev);
			});
			o.on('value', function(ev){
				observedEvents2.push(ev);
			});
			canceler1();
			o._emit('value', "hello");
			assert.deepEqual(observedEvents1, [
			]);
			assert.deepEqual(observedEvents2, [
				"hello",
			]);
		},
	});

});