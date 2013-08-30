define([
	'collections/shim-array'
], function(

){
	// mixin qui implemnte l'API orderedContent pour un HtmlElement
	// l'API "orderedContent" expose une méthode 'set("content", orderedListOfComponents)'
	// 'orderedListOfComponents' est une collection ordonnée de composants uniques
	// on ne s'occupe pas de l'objet 'orderedListOfComponents' lui-même mais de son contenu : les composants et leur ordre
	// si l'objet 'orderedListOfComponents' est modifiée, cela n'est pas observé par le container
	// par contre, le container peut optimiser les insertions/suppressions dans le dom entre 2 appels successifs de set("content")
	var WithOrderedContentForHtmlElement = function() {
	};
	WithOrderedContentForHtmlElement.prototype = {
		_contentSetter: function(cmps){
			var content = [];
			cmps.forEach(function(cmp){
				content.push(cmp);
			});
			this._content = content;
		},
		_contentGetter: function(){
			return this._content || [];
		},
		_applyContent: function() {
			var domNode = this.get("domNode");
			// store old content for comparison purpose
			var oldContent = this._oldContent;
			var newContent = this._oldContent = this.get("content");

			// remove domNode of components that are no longer in content
			var removed = oldContent && oldContent.filter(function(item){
				return ! newContent.has(item);
			}) || [];
			removed.forEach(function(cmp){
				domNode.removeChild(cmp.get("domNode"));
			});
			// insert new components and move current components
			newContent.forEach(function(cmp, index) {
				var currentNode = domNode.children[index];
				var cmpNode = cmp.get("domNode");

				if (currentNode !== cmpNode){
					domNode.insertBefore(cmpNode, currentNode);
				}
			});
		}
	};

	return WithOrderedContentForHtmlElement;
});