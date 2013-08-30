define([
	'intern!object',	'intern/chai!assert',
	'../HtmlElement'
], function(
	registerSuite,		assert,
	HtmlElement
) {
	var div;
	var domNode;
	registerSuite({
		name : "HtmlElement",
		beforeEach : function() {
			div = new HtmlElement('div');
			domNode = div.get('domNode');
		},
		"DOM-node created": function() {
			assert(domNode instanceof HTMLElement, "domNode is a native HtmlElement");
			assert.equal(domNode.tagName, 'DIV');
		},

		"node's attributes proxied": function() {
			div.set('innerHTML', "Test");
			assert.equal(domNode.innerHTML, "Test");

			domNode.id = "test";
			assert.equal(div.get('id'), "test");
		}
	});
});