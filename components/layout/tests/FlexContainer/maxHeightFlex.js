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
	css.sheet.insertRule('.flex { background-color: lightblue; overflow: auto; line-height: 2em; }', css.sheet.cssRules.length);

	var container = window.container = new FlexContainer({
		orientation: 'vertical'
	});

	var div1 = new HtmlElement('div', { innerHTML: 'Fixed - With a long content so that we can increase height of this bloc by resizing the viewport', className: 'fixed' });
	//div1.domNode.style.background = '#AFF';
	var div2 = new HtmlElement('div', { innerHTML: '<div>Flex</div><div>Try to resize the viewport in order to make this content fill it completely</div><div>This flex element should become scrollable when reaching the maximum height available in its parent container.</div>', className: 'flex' });
	//div2.domNode.style.background = '#FAF';
	var div3 = new HtmlElement('div', { innerHTML: 'Fixed', className: 'fixed' });
	//div3.domNode.style.background = '#FFA';

	container.content.setContent([
		div1,
		[div2, { flexMax: true }],
		div3
	]);

	new WindowContainer({
		content: container
	});
});