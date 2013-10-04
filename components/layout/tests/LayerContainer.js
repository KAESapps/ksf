define([
	'../LayerContainer',
	'ksf/components/HtmlContainer',
	'ksf/components/HtmlElement',
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
	css.sheet.insertRule('.layer0, .layer1 { background-color: lightblue; border: 15px solid gray; box-sizing: border-box; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.LayerContainer { border: 1px solid gray; box-sizing: border-box; }', css.sheet.cssRules.length);
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

	var container = new LayerContainer({
		content: [
			layer0,
		],
		className: 'LayerContainer'
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

	var showButton = new HtmlElement('button', {
		textContent: "Show panel",
	});
	var layer1 = new HtmlContainer('div', {
		content: [showButton],
		bounds: { height: 300, width: 500 }
	});
	layer1.style.set('base', 'layer1');


	var hideButton = new HtmlElement('button', {
		textContent: "Hide panel",
	});
	var panel2 = new HtmlContainer('div', {
		content: [hideButton],
		bounds: { height: 200, width: 200 }
	});
	panel2.style.set('base', 'panel');

	var container2 = new LayerContainer({
		content: [
			layer1,
		],
		className: 'LayerContainer'
	});

	showButton.on('click', function() {
		container2.set('content', [
			layer1,
			[panel2, { verticalAlign: 'bottom', horizontalAlign: 'right' }],
		]);
	});
	hideButton.on('click', function() {
		container2.set('content', [
			layer1,
		]);
	});


	document.body.appendChild(container.get('domNode'));
	document.body.appendChild(container2.get('domNode'));
	container.startLiveRendering();
	container2.startLiveRendering();

});