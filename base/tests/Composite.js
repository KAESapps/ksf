define([
	'intern!object',
	'intern/chai!assert',
	'compose/compose',
	'../Composite',
], function(
	registerSuite,
	assert,
	compose,
	Composite
) {
	var cmp3 = {name: 'cmp3'};
	var Cmp = compose(Composite, function() {
		this._components.factories.setEach({
			cmp1: function() { return {name: 'cmp1'}; },
			cmp2: function() { return {name: 'cmp2'}; },
		});
		this._components.registry.set('cmp3', cmp3);
	});

	var cmp;

	registerSuite({
		name: "lazily created components",
		beforeEach : function() {
			cmp = new Cmp();
		},
		"get": function(){
			assert.equal(cmp._components.registry.get('cmp1'), undefined);
			var cmp1 = cmp._components.get('cmp1');
			assert.equal(cmp._components.registry.get('cmp1'), cmp1);
			assert.equal(cmp._components._counters['cmp1'], 1);
		},
		"release": function() {
			var cmp1 = cmp._components.get('cmp1');
			cmp._components.release('cmp1');
			assert.equal(cmp._components.registry.get('cmp1'), undefined);
			assert.equal(cmp._components._counters['cmp1'], undefined);
		},
		"has": function() {
			assert(cmp._components.has('cmp1'));
		},
		"observe changes": function() {
			var cbCalled;
			cmp._components.registry.asStream('changes').onValue(function(changes) {
				assert.equal(changes.length, 1);
				assert.equal(changes[0].value.name, 'cmp1');
				cbCalled = true;
			});
			cmp._components.get('cmp1');
			assert(cbCalled);
		},
	});

	registerSuite({
		name: "non lazily created components",
		beforeEach : function() {
			cmp = new Cmp();
		},
		"get": function(){
			assert.equal(cmp._components.registry.get('cmp3'), cmp3);
			assert.equal(cmp._components.get('cmp3'), cmp3);
			assert.equal(cmp._components._counters['cmp3'], undefined);
		},
		"release": function() {
			cmp._components.get('cmp3');
			cmp._components.release('cmp3');
			assert.equal(cmp._components.registry.get('cmp3'), cmp3);
			assert.equal(cmp._components._counters['cmp3'], undefined);
		},
		"has": function() {
			assert(cmp._components.has('cmp3'));
		},
		"observe changes": function() {
			var cbCalled;
			cmp._components.registry.asStream('changes').onValue(function(changes) {
				assert.equal(changes.length, 1);
				assert.equal(changes[0].value.name, 'cmp3');
				cbCalled = true;
			});
			cmp._components.get('cmp3');
			assert(!cbCalled);
		},
	});

});