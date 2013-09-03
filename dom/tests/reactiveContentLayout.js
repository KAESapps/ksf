define([
	'intern!object',	'intern/chai!assert',
	'compose',
	'put-selector/put',
	'ksf/components/layout/FlexContainer',	'ksf/components/layout/WindowContainer',
	'ksf/components/HtmlElement',
	'../Sizeable',
], function(
	registerSuite,		assert,
	compose,
	put,
	FlexContainer,							WindowContainer,
	HtmlElement,
	Sizeable
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; margin: 0; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.fixed { background-color: lightgray; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.flex { background-color: lightblue; }', css.sheet.cssRules.length);


	var SizeableElmt = compose(
		HtmlElement,
		Sizeable,
		{
			updateRendering: function() {
				HtmlElement.prototype.updateRendering.apply(this, arguments);
				this._applyBounds();
			}
		}
	);

	var container = window.container = new FlexContainer({
		orientation: 'vertical'
	});

	window.div1 = new SizeableElmt('div', { innerHTML: 'Fixed', className: 'fixed' });
	//div1.domNode.style.background = '#AFF';
	var div2 = new SizeableElmt('div', { innerHTML: 'Flex', className: 'flex' });
	//div2.domNode.style.background = '#FAF';
	var div3 = new SizeableElmt('div', { innerHTML: 'Fixed', className: 'fixed' });
	//div3.domNode.style.background = '#FFA';

	container.set('content', [
		div1,
		[div2, { flex: true }],
		div3
	]);

	new WindowContainer({
		content: container
	});

	div1.set('innerHTML', "Fixed - With a long content so that we can increase height of this bloc by resizing the viewport");
	div1.updateRendering();
});