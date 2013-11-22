define([
	'../../WindowContainer',
	'../../FlexContainer',
	'../../../HtmlElement'
], function(
	WindowContainer,
	FlexContainer,
	HtmlElement
){
	window.renderingLog = true;

	// create css rules
	var css = document.createElement('style');
	css.type = 'text/css';
	document.head.appendChild(css);
	css.sheet.insertRule('html, body { height: 100%; overflow: hidden }', css.sheet.cssRules.length);
	css.sheet.insertRule('* { margin: 0; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.fixed { background-color: lightgray; border: 1px solid gray; }', css.sheet.cssRules.length);
	css.sheet.insertRule('.flex { background-color: lightblue; border: 1px solid gray; }', css.sheet.cssRules.length);

	var main = window.main = new FlexContainer({
		orientation: 'vertical',
	});
	main._style.set('name', 'main');

	var img = new HtmlElement('img', { width: 150, height: 150, alt: "Logo", className: 'fixed'});
	img._style.set('name', 'img');

	var title = new HtmlElement('h1', { innerHTML: "Title", className: 'flex'});
	title._style.set('name', 'title');

	var header = new FlexContainer({
		orientation: 'horizontal',
	});
	header._style.set('name', 'header');
	header.content.setContent([
		img,
		[title, { flex: true }]
	]);

	var centerLeft = new HtmlElement('div', { innerHTML: "Flex", className: 'flex'});
	centerLeft._style.set('name', 'centerLeft');

	var centerRight = new HtmlElement('div', { innerHTML: "Flex", className: 'flex'});
	centerRight._style.set('name', 'centerRight');

	var center = new FlexContainer({
		orientation: 'horizontal',
	});
	center._style.set('name', 'center');
	center.content.setContent([
		[centerLeft, { flex: true }],
		[centerRight, { flex: true }]
	]);

	var longContent = new HtmlElement('div', { innerHTML: "Fixed - With a long content so that we can increase height of this bloc by resizing the viewport", className: 'fixed' });
	longContent._style.set('name', 'longContent');

	var footer = new HtmlElement('div', { innerHTML: "Fixed", className: 'fixed', name: 'footer'});
	footer._style.set('name', 'footer');

	main.content.setContent([
		header,
		longContent,
		[center, { flex: true }],
		footer,
	]);

	console.group('insertion in dom');
	console.time('insertion in dom');
	main.startLiveRendering();
	document.body.appendChild(main.domNode);
	main.set('inDom', true);
	console.timeEnd('insertion in dom');
	console.groupEnd('insertion in dom');

	var resize300x600Timer = 'resize to 300x600';
	console.group(resize300x600Timer);
	console.time(resize300x600Timer);
	main.set('bounds', {
		height: 600,
		width: 300,
	});
	console.timeEnd(resize300x600Timer);
	console.groupEnd(resize300x600Timer);


});