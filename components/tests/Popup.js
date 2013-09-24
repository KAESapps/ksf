define([
	'intern!object',	'intern/chai!assert',
	'ksf/components/layout/WindowContainer',
	'ksf/components/HtmlContainer',	'ksf/components/HtmlElement',
	'../Popup'
], function(
	registerSuite,		assert,
	WindowContainer,
	HtmlContainer,					HtmlElement,
	Popup
) {
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; overflow: hidden }', css.sheet.cssRules.length);
	css.sheet.insertRule('.area { background-color: lightblue; border: 15px solid gray; margin-left: 50px; box-sizing: border-box; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.mask { background-color: rgba(200, 200, 200, 0.8); }', css.sheet.cssRules.length);

	var area;
	registerSuite({
		name : "Popup",
		beforeEach : function() {
			area = new HtmlContainer('div', {
				textContent: "Area",
				bounds: { height: 300, width: 400 }
			});
			area.style.set('base', 'area');
			document.body.appendChild(area.get('domNode'));
			area.startLiveRendering();
		},
		"Popup": function() {
			var popup = new Popup({
				area: area,
				content: new HtmlElement('button', { textContent: "OK" })
			});
			document.body.appendChild(popup.get('domNode'));
			popup.startLiveRendering();

			popup.set('open', true);

			popup.set('content', new HtmlElement('button', { textContent: "Valider" }));

			area.set('bounds', { height: 500, width: 700 });
		}
	});
});