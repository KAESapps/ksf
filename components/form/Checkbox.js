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
		function () {
			this._component = new HtmlElement('input', {type: 'checkbox'}, null, {
				change: 'checked',
			});
			this._component.domAttrs.bind('checked', this, 'value');
		}
	);
});