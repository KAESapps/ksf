define([
	'compose',
	'./WithDomNode'
], function(
	compose,
	WithDomNode
){
	return compose(WithDomNode, {
		createRendering: function() {
			this.set('domNode', document.createElement(this._tag));
		},

		destroyRendering: function() {
			this.remove('domNode');
		},

		// si on considère qu'un HtmlElement est forcément réactif, je pense qu'il n'y a pas besoin de 'updateRendering'
/*		updateRendering: function() {
			this.forEach(function(value, prop) {
				this._applyDomAttr(prop, value);
			}.bind(this));
		},
*/
		_applyDomAttr: function(prop, value) {
			this._domNode[prop] = value;
			if (prop === 'innerHTML') {
				this._emit('sizechanged');
			}
		}
	});
});