define([
	'compose',
	'ksf/dom/composite/CompositeMono',
	'../HtmlElement',
], function(
	compose,
	CompositeMono,
	HtmlElement
){
	return compose(
		CompositeMono,
		function (args) {
			var domEvents = {
				change: 'files',
			};
			this._component = new HtmlElement('input', {type: 'file'}, {}, domEvents);
			this.setR('files', this._component.domAttrs.getR('files'));
		}
	);
});