define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'./HtmlElementWithChanged',
], function(
	compose,
	CompositeMono,
	HtmlElementWithChanged
){
	return compose(
		CompositeMono,
		function(args) {
			this._component = new HtmlElementWithChanged('input', {type: args && args.type || "text"});
			this._component.bind('value', this, 'value');
		}
	);
});