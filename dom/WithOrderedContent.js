define([
], function(
){
	return {
		_applyContent: function() {
			var domNode = this.domNode;
			// store old content for comparison purpose
			var oldContent = this._currentContent;
			var newContent = this._currentContent = this.get("content");

			// remove domNode of components that are no longer in content
			var removed = oldContent && oldContent.filter(function(item){
				return newContent.indexOf(item) <= 0;
			}) || [];
			removed.forEach(function(cmp){
				domNode.removeChild(cmp.domNode);
			});
			// insert new components and move current components
			newContent.forEach(function(cmp, index) {
				var currentNode = domNode.children[index];
				var cmpNode = cmp.domNode;

				if (currentNode !== cmpNode){
					domNode.insertBefore(cmpNode, currentNode || null);
				}
			});
		}
	};
});