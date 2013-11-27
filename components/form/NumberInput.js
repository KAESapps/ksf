define([
	"compose",
	"ksf/dom/composite/CompositeMono",
	"../HtmlElement",
], function(
	compose,
	CompositeMono,
	HtmlElement
){
	return compose(
		CompositeMono,
		function (args) {
			var domEvents = {
				change: 'value',
			};
			if (args && args.updateFrequently) {
				domEvents.keyup = 'value';
			}
			this._component = new HtmlElement('input', {type: 'number'}, null, domEvents);
			this._component.domAttrs.bind('value', this, 'value', {
				convert: function(number) { return number; }, // nothing to do
				revert: function(string) {
					var number = parseFloat(string, 10);
					return isNaN(number) ? undefined : number;
				},
			});
		}
	);
});