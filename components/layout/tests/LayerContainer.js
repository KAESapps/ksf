define([
	'../LayerContainer',
	'../../HtmlContainer',
	'../../HtmlElement',
], function(
	LayerContainer,
	HtmlContainer,
	HtmlElement
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; overflow: hidden }', css.sheet.cssRules.length);
	css.sheet.insertRule('.layer { background-color: lightblue; border: 15px solid gray; box-sizing: border-box; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.LayerContainer { box-sizing: border-box; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.panel { background-color: rgba(200, 200, 200, 0.8); }', css.sheet.cssRules.length);

	var showButton = new HtmlElement('button', {
		textContent: "Show panel",
	});
	var layer = new HtmlContainer('div');
	layer.content.add(showButton);
	layer.style.set('base', 'layer');


	var hideButton = new HtmlElement('button', {
		textContent: "Hide panel",
	});
	var panel = new HtmlContainer('div', {
		bounds: { height: 200, width: 200 }
	});
	panel.content.add(hideButton);
	panel.style.set('base', 'panel');

	var container2 = new LayerContainer({
		bounds: { height: 300, width: 500 }
	});
	container2.content.setContent([
		layer
	]);

	showButton.on('click', function() {
		container2.content.add([panel, { verticalAlign: 'bottom', horizontalAlign: 'right' }]);
	});
	hideButton.on('click', function() {
		container2.content.remove(1);
	});

	document.body.appendChild(container2.domNode);
	container2.startLiveRendering();
});