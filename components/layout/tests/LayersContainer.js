define([
	// '../LayersContainer',
	'ksf/components/HtmlContainer',
	'ksf/components/HtmlElement',
], function(
	// layersContainer,
	HtmlContainer,
	HtmlElement
){
	// create css rules
	var css = document.createElement("style");
	css.type = "text/css";
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; overflow: hidden }', css.sheet.cssRules.length);
	css.sheet.insertRule('.layer0 { background-color: lightblue; border: 15px solid gray; margin-left: 50px; box-sizing: border-box; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.panel { background-color: rgba(200, 200, 200, 0.8); }', css.sheet.cssRules.length);


	var showButton = new HtmlElement('button', {
		textContent: "Show panel",
	});
	var layer0 = new HtmlContainer('div', {
		content: [showButton],
		bounds: { height: 300, width: 400 }
	});
	layer0.style.set('base', 'layer0');


	var hideButton = new HtmlElement('button', {
		textContent: "Hide panel",
	});
	var panel = new HtmlContainer('div', {
		content: [hideButton],
		bounds: { height: 300, width: 100 }
	});
	panel.style.set('base', 'panel');

	var container = new HtmlContainer('div', {
		content: [
			layer0,
		],
	});

	showButton.on('click', function() {
		container.set('content', [
			layer0,
			panel,
		]);
	});
	hideButton.on('click', function() {
		container.set('content', [
			layer0,
		]);
	});


	document.body.appendChild(container.get('domNode'));
	container.startLiveRendering();



});