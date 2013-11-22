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
		name: 'main',
	});
	var header = new FlexContainer({
		orientation: 'horizontal',
		name: 'header',
	});
	header.content.setContent([
		new HtmlElement('img', { width: 150, height: 150, alt: "Logo", className: 'fixed', name: 'img'}),
		[new HtmlElement('h1', { innerHTML: "Title", className: 'flex', name: 'title'}), { flex: true }]
	]);
	var center = new FlexContainer({
		orientation: 'horizontal',
		name: 'center',
	});
	center.content.setContent([
		[new HtmlElement('div', { innerHTML: "Flex", className: 'flex', name: 'centerLeft'}), { flex: true }],
		[new HtmlElement('div', { innerHTML: "Flex", className: 'flex', name: 'centerRight'}), { flex: true }]
	]);
	main.content.setContent([
		header,
		new HtmlElement('div', { innerHTML: "Fixed - With a long content so that we can increase height of this bloc by resizing the viewport", className: 'fixed', name: 'longContent' }),
		[center, { flex: true }],
		new HtmlElement('div', { innerHTML: "Fixed", className: 'fixed', name: 'footer'})
	]);

	console.group('insertion in dom');
	console.time('insertion in dom');
	document.body.appendChild(main.domNode);
	main.startLiveRendering();
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