define([
	'intern!object',	'intern/chai!assert',
	'dojo/_base/lang',
	'compose',
	'ksf/components/HtmlElement',	'ksf/components/layout/HTMLContainer'
], function(
	registerSuite,		assert,
	lang,
	compose,
	HtmlElement,					HTMLContainer
) {
	var main;
	registerSuite({
		name : "Simple DOM structure",
		beforeEach : function() {
			main = new HTMLContainer('div', {
				content: [
					new HTMLContainer('ul', {
						content: [
							new HtmlElement('li', { innerHTML: "1" }),
							new HtmlElement('li', { innerHTML: "2" }),
							new HtmlElement('li', { innerHTML: "3" })
						]
					}),
					new HTMLContainer('ul', {
						content: [
							new HtmlElement('li', { innerHTML: "4" }),
							new HtmlElement('li', { innerHTML: "5" })
						]
					})
				]
			});
		},
		"Complete rendering detached": function() {
			var root = main.get('domNode');
			document.body.appendChild(root);
			assert(root);
			assert.equal(root.children.length, 2);
			assert.equal(root.children[0].children.length, 3);
			assert.equal(root.children[1].children.length, 2);
		}
	});
});