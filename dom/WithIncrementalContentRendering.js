define([
	'ksf/collections/OrderableSet',
], function(
	OrderableSet

){
	// mixin qui implemnte l'API orderedContent pour un HtmlElement
	// l'API "orderedContent" expose une méthode 'set("content", orderedListOfComponents)'
	// 'orderedListOfComponents' est une collection ordonnée de composants uniques
	// on ne s'occupe pas de l'objet 'orderedListOfComponents' lui-même mais de son contenu : les composants et leur ordre
	// par contre l'objet retourné par "get('content')" est un réactif incrémental, c'est à dire qui supporte "updateContent" et "updateContentR"
	var WithIncrementalContentRendering = function(){
		this._content = new OrderableSet();

		this._content.asStream("changes").onValue(this._applyContentChanges.bind(this));
	};
	WithIncrementalContentRendering.prototype = {
		_applyContentChanges: function(changes) {
			var domNode = this.get('domNode');
			changes.forEach(function(change) {
				if (change.type === 'add') {
					domNode.insertBefore(change.value.get('domNode'), domNode.children[change.index]);
				} else {
					domNode.removeChild(change.value.get('domNode'));
				}
			});
		},
		_contentSetter: function(cmps){
			this.get("content").setContent(cmps);
		},
		_contentGetter: function(){
			return this._content;
		},
	};

	return WithIncrementalContentRendering;
});