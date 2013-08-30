define([
	'compose',
	'./HtmlElement',
	'ksf/dom/WithIncrementalContentRendering',
], function(
	compose,
	HtmlElement,
	WithIncrementalContentRendering
){
	return compose(
		HtmlElement,
		WithIncrementalContentRendering
	);
});