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
	var css = document.createElement('style');
	css.type = 'text/css';
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; overflow: hidden }', css.sheet.cssRules.length);
	css.sheet.insertRule('* { margin: 0; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.fixed { background-color: lightgray; border: 1px solid gray; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.flex { background-color: lightblue; border: 1px solid gray; }', css.sheet.cssRules.length);

	var main = new FlexContainer({
		orientation: 'vertical'
	});
	var header = new FlexContainer({
		orientation: 'horizontal'
	});
	header.content.setContent([
		new HtmlElement('img', { width: 150, height: 150, alt: "Logo", className: 'fixed' }),
		[new HtmlElement('h1', { innerHTML: "Title", className: 'flex'  }), { flex: true }]
	]);
	var center = new FlexContainer({
		orientation: 'horizontal'
	});
	center.content.setContent([
		[new HtmlElement('div', { innerHTML: "Flex", className: 'flex' }), { flex: true }],
		[new HtmlElement('div', { innerHTML: "Flex", className: 'flex' }), { flex: true }]
	]);
	main.content.setContent([
		header,
		new HtmlElement('div', { innerHTML: "Fixed - With a long content so that we can increase height of this bloc by resizing the viewport", className: 'fixed' }),
		[center, { flex: true }],
		new HtmlElement('div', { innerHTML: "Fixed", className: 'fixed' })
	]);

	new WindowContainer({
		content: main
	});
});