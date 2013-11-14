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
			args = args || {};
			args.type = args.type || 'text';
			this.set('value', args.value || "");
			this._component = new HtmlElementWithChanged('input', args);
			this._component.bind('value', this, 'value');
		}
	);
});