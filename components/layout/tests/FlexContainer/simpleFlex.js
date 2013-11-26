define([
	'intern!object',	'intern/chai!assert',
	'../../WindowContainer',
	'../../FlexContainer',
	'../../../HtmlElement'
], function(
	registerSuite,		assert,
	WindowContainer,
	FlexContainer,
	HtmlElement
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; margin: 0; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.fixed { background-color: lightgray; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.flex { background-color: lightblue; }', css.sheet.cssRules.length);

	var container = window.container = new FlexContainer({
		orientation: 'vertical',
		content: [
			new HtmlElement('div', { innerHTML: 'Fixed - With a long content so that we can increase height of this bloc by resizing the viewport', className: 'fixed' }),
			[new HtmlElement('div', { innerHTML: 'Flex', className: 'flex' }), { flex: true }],
			new HtmlElement('div', { innerHTML: 'Fixed', className: 'fixed' }),
		]
	});

	new WindowContainer({
		content: container
	});
});