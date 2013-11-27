define([
	"compose",
	"ksf/dom/composite/CompositeMono",
	"../HtmlElement",
], function(
	compose,
	CompositeMono,
	HtmlElement
){
	var HtmlElementWithValueBinded = compose(
		HtmlElement,
		function(tag, domAttrs, options) {
			var domNode = this.domNode;
			var valueChange = function(ev) {
				this.domAttrs.set('value', domNode.value);
			}.bind(this);
			domNode.addEventListener('change', valueChange);
			this.own(function() {
				domNode.removeEventListener('change', valueChange);
			});
			if (options.updateFrequently) {
				domNode.addEventListener('keyup', valueChange);
				this.own(function() {
					domNode.removeEventListener('keyup', valueChange);
				});
			}
		}
	);

	return compose(
		CompositeMono,
		function (args) {
			this._component = new HtmlElementWithValueBinded('input', {type: 'number'}, {updateFrequently: args && args.updateFrequently});
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