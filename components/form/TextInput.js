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
			var self = this,
				domEvents = {
				change: 'value',
			};
			if (args) {
				if (args.updateFrequently) {
					domEvents.keyup = 'value';
				}
				// "fieldName" property is only useful when used in a form
				args.fieldName && this.set('fieldName', args.fieldName);
				args.passwordDisplay && this.set('passwordDisplay', args.passwordDisplay);
				args.placeholder && this.set('placeholder', args.placeholder);
				args.hint && this.set('hint', args.hint);
			}
			this._component = new HtmlElement('input', {type: 'text'}, null, domEvents);
			this._component.domAttrs.bind('value', this, 'value');

			this.getR('passwordDisplay').onValue(function(pass) {
				self._component.domAttrs.set('type', pass ? 'password' : 'text');
			});
			this.getR('fieldName').onValue(function(fieldName) {
				fieldName && self._component.domAttrs.set('name', fieldName);
			});
			this.getR('placeholder').onValue(function(placeholder) {
				placeholder && self._component.domAttrs.set('placeholder', placeholder);
			});
			this.getR('hint').onValue(function(hint) {
				hint && self._component.domAttrs.set('title', hint);
			});
		}
	);
});