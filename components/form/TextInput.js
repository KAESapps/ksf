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
			this._component = new HtmlElement('input', {type: 'text'}, null, domEvents);
			this._component.domAttrs.bind('value', this, 'value');
		}
	);
});