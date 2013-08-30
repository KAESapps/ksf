define([
	'intern!object',	'intern/chai!assert',
	'../DomComponent'
], function(
	registerSuite,		assert,
	DomComponent
) {
	"strict mode";

	var owner, domNode, sub1, sub2, subSub1, subSub2;
	registerSuite({
		name: "DOM components",
		beforeEach: function() {
			sub1 = new DomComponent();
			sub2 = document.createElement('div');
			subSub1 = new DomComponent();
			subSub2 = document.createElement('div');

			owner = new DomComponent();

			owner._componentsFactory.addEach({
				sub1: function() { return sub1; },
				sub2: function() { return sub2; },
				subSub1: function() { return subSub1; },
				subSub2: function() { return subSub2; }
			});

			owner._layout.set([
				"sub1",
				['sub2', [
					'subSub1',
					'subSub2'
				]]
			]);
		},

		"DOM-node creation": function() {
			assert.equal(owner.domNode.tagName, 'DIV', "Tag name is 'div'");
		},

		"placement": function() {
			assert(owner.domNode.contains(sub1.domNode), "sub1 in root");
			assert(owner.domNode.contains(sub2), "sub2 in root");
			assert(sub2.contains(subSub1.domNode), "subSub1 in sub2");
			assert(sub2.contains(subSub2), "subSub2 in sub2");
		},

		"bindings": function() {
			var binding1, binding2, binding3;

			owner._bindingsFactory.addEach([
				[['sub1', 'sub2'], function() { binding1 = true; }],
				[['sub3', 'subSub2'], function() { binding2 = true; }]
			]);
			assert(binding1);
			assert(!binding2);

			owner._components.add(new Object(), 'sub3');
			assert(binding2);

			owner._bindingsFactory.add(function() { binding3 = true; }, ['sub2']);
			assert(binding3);
		},

		"set name of components based on their registry id": function(){
			assert.equal(sub1.name, "sub1");
			assert(sub1.domNode.classList.contains("sub1"));
			assert(sub2.classList.contains("sub2"));
		},

		"add a css class with constructor.name on domNode": function(){
			assert(owner.domNode.classList.contains("DomComponent"));
		},

	});
});
