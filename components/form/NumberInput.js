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
			this._component = new HtmlElementWithChanged('input', {type: "number"});
			this._component.bind('value', this, 'value', {
				convert: function(number) { return number; }, // nothing to do
				revert: function(string) {
					var number = parseFloat(string, 10);
					return isNaN(number) ? undefined : number;
				},
			});
		}
	);
});