define([
	'intern!object',
	'intern/chai!assert',
	'compose/compose',
	'../Evented',
], function(
	registerSuite,
	assert,
	compose,
	Evented
) {

	var o;

	registerSuite({
		beforeEach : function() {
			o = compose.create(Evented);
		},
		"emit one event": function(){
			var cbCalled;
			o.on("changed", function(ev){
				assert.equal(ev.type, "changed");
				assert.equal(ev.emiter, o);
				cbCalled = true;
			});
			o._emit("changed");
			assert(cbCalled);
		},
		"pause and resume emit": function(){
			var cbCalledCount = 0;
			o.on("changed", function(ev){
				assert.equal(ev.type, "changed");
				assert.equal(ev.emiter, o);
				cbCalledCount ++;
			});
			o._pauseEmit();
			o._emit("changed");
			assert.equal(cbCalledCount, 0);
			o._emit("changed");
			o._resumeEmit();
			assert.equal(cbCalledCount, 2);
		},
	});

});