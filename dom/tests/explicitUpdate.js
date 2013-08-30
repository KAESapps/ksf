define([
	'intern!object',	'intern/chai!assert',
	'compose',
	'ksf/components/HtmlElement',	'ksf/components/layout/ContainerBase',
	'../WithOrderedContent'
], function(
	registerSuite,		assert,
	compose,
	HtmlElement,					ContainerBase,
	WithOrderedContent
) {
	var main;
	var Container = compose(
		ContainerBase,
		WithOrderedContent,
		{
			createRendering: function() {
				ContainerBase.prototype.createRendering.apply(this, arguments);
				this._applyContent(this.get('content'));
			}
		}
	);

	registerSuite({
		name : "Simple DOM structure",
		beforeEach : function() {
			main = new Container();
		},
		"Updating rendering": function() {
			main.set('content', [
				new HtmlElement('li', { innerHTML: "1" }),
				new HtmlElement('li', { innerHTML: "2" }),
				new HtmlElement('li', { innerHTML: "3" })
			]);
			var root = main.get('domNode');
			document.body.appendChild(root);

			assert(root);
			assert.equal(root.children.length, 3);

			main.set('content', [
				new HtmlElement('li', { innerHTML: "4" }),
				new HtmlElement('li', { innerHTML: "5" })
			]);

			assert.equal(root.children.length, 3, "Rendering not updated, still 3 children");
			main.updateRendering();
			assert.equal(root.children.length, 2, "Rendering updated, 2 children");
		}
	});
});