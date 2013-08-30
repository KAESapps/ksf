define([
	'compose',
	'../HtmlElement',
	'ksf/dom/proxyEvent'
], function(
	compose,
	HtmlElement,
	proxyEvent
){
	return compose(
		HtmlElement,
		proxyEvent.changed
	);
});