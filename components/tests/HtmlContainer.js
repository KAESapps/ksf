define([
	'intern!object',	'intern/chai!assert',
	'../HtmlContainer',	'../HtmlElement',
	'ksf/utils/destroy'
], function(
	registerSuite,		assert,
	HtmlContainer,		HtmlElement,
	destroy
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
			container.startLiveRendering();
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

			var liveRendering = container.startLiveRendering();

			assert.equal(domNode.children.length, 3);

			destroy(liveRendering);

			container.content.add(new HtmlElement('option', { textContent: "Option 0" }), 0);
			container.content.add(new HtmlElement('option', { textContent: "Option 4" }));

			assert.equal(domNode.children.length, 3);
			assert.equal(container.content.length, 5);

			container.startLiveRendering();

			assert.equal(domNode.children.length, 5);
		}
	});
});