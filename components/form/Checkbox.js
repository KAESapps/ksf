define([
	"compose",
	"ksf/dom/composite/CompositeMono",
	"../HtmlElement",
], function(
	compose,
	CompositeMono,
	HtmlElement
){

	var HtmlElementWithCheckedBinded = compose(
		HtmlElement,
		function() {
			var domNode = this.domNode;
			var valueChange = function(ev) {
				this.domAttrs.set('checked', domNode.checked);
			}.bind(this);
			domNode.addEventListener('change', valueChange);
			this.own(function() {
				domNode.removeEventListener('change', valueChange);
			});
		}
	);

	return compose(
		CompositeMono,
		function () {
			this._component = new HtmlElementWithCheckedBinded('input', {type: 'checkbox'});
			this._component.domAttrs.bind('checked', this, 'value');
		}
	);
});