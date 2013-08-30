define([
	'intern!object',	'intern/chai!assert',
	'compose',
	"put-selector/put",
	"ksf/components/layout/FlexContainer",
	"ksf/components/layout/WindowContainer",
	'ksf/components/HtmlElement',
	'../Sizeable',
	'../WithOuterSize'
], function(
	registerSuite,		assert,
	compose,
	put,
	FlexContainer,
	WindowContainer,
	HtmlElement,
	Sizeable,
	WithOuterSize
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; overflow: hidden }', css.sheet.cssRules.length);
	css.sheet.insertRule('* { margin: 0; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.fixed { background-color: lightgray; border: 1px solid gray; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.flex { background-color: lightblue; border: 1px solid gray; }', css.sheet.cssRules.length);

	var SizeableElmt = compose(
		HtmlElement,
		Sizeable,
		WithOuterSize,
		{
			updateRendering: function() {
				HtmlElement.prototype.updateRendering.apply(this, arguments);
				Sizeable.prototype.updateRendering.apply(this, arguments);
			}
		}
	);

	window.div1 = new SizeableElmt('div', { innerHTML: "Fixed", className: 'fixed' });

	var main = new FlexContainer({
		orientation: 'vertical',
		content: [
			new FlexContainer({
				orientation: 'horizontal',
				content: [
					new SizeableElmt('img', { width: 150, height: 150, alt: "Logo", className: 'fixed' }),
					[new SizeableElmt('h1', { innerHTML: "Title", className: 'flex'  }), { flex: true }]
				]
			}),
			div1,
			[new FlexContainer({
				orientation: 'horizontal',
				content: [
					[new SizeableElmt('div', { innerHTML: "Flex", className: 'flex' }), { flex: true }],
					[new SizeableElmt('div', { innerHTML: "Flex", className: 'flex' }), { flex: true }]
				]
			}), { flex: true }],
			new SizeableElmt('div', { innerHTML: "Fixed", className: 'fixed' })
		]
	});

	new WindowContainer({
		content: main
	});

	div1.set('innerHTML', "Fixed - With a long content so that we can increase height of this bloc by resizing the viewport");
	div1.updateRendering();
});