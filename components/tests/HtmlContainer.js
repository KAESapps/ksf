define([
	'intern!object',	'intern/chai!assert',
	'../HtmlContainer',	'../HtmlElement'
], function(
	registerSuite,		assert,
	HtmlContainer,		HtmlElement
) {
	var container;
	var domNode;
	registerSuite({
		name : "HtmlElement",
		beforeEach : function() {
			container = new HtmlContainer('select');
			domNode = container.domNode;
			document.body.appendChild(domNode);
		},
		"DOM-node created": function() {
			assert(domNode instanceof HTMLElement, "domNode is a native HtmlElement");
			assert.equal(domNode.tagName, 'SELECT');
		},

		"Children not appended immediately in DOM-node": function() {
			container.content.setContent([
				new HtmlElement('option', { textContent: "Option 1" }),
				new HtmlElement('option', { textContent: "Option 2" }),
				new HtmlElement('option', { textContent: "Option 3" })
			]);
			assert.equal(container.content.length, 3);
			assert.equal(domNode.children.length, 0);
			container.updateDom();
			assert.equal(domNode.children.length, 3);
		},

		"Incremental insertion of children": function() {
			container.content.addEach([
				new HtmlElement('option', { textContent: "Option 1" }),
				new HtmlElement('option', { textContent: "Option 2" }),
				new HtmlElement('option', { textContent: "Option 3" })
			]);
			assert.equal(container.content.length, 3);
			assert.equal(domNode.children.length, 0);
			container.updateDom();
			assert.equal(domNode.children.length, 3);
			container.content.add(new HtmlElement('option', { textContent: "Option 0" }), 0);
			container.content.add(new HtmlElement('option', { textContent: "Option 4" }));
			assert.equal(domNode.children.length, 3);
			assert.equal(container.content.length, 5);
			container.updateDom();
			assert.equal(domNode.children.length, 5);
		}
	});
});