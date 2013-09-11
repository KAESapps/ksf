define([
	"compose",
	"ksf/dom/composite/CompositeMono",
	"./HtmlElementWithChanged",
], function(
	compose,
	CompositeMono,
	HtmlElementWithChanged
){
	return compose(
		CompositeMono,
		function () {
			this._component = new HtmlElementWithChanged('input', {type: 'checkbox'});
			this._component.bind('checked', this, 'value');
		}
	);
});