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
			domNode = div.domNode;
		},
		"DOM-node created": function() {
			assert(domNode instanceof HTMLElement, "domNode is a native HtmlElement");
			assert.equal(domNode.tagName, 'DIV');
		},

		"node properties not set immediately on DOM-node": function() {
			div.domAttrs.set('innerHTML', "Test");
			assert.equal(domNode.innerHTML, "");
			div.startLiveRendering();
			assert.equal(domNode.innerHTML, "Test");
		},
		"node's attributes proxied": function() {
			domNode.id = "test";
			assert.equal(div.domAttrs.get('id'), "test");
		}
	});
});