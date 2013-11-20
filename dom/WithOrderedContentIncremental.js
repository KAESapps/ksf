define([
	'compose'
], function(
	compose
){
	return compose({
		_applyContentChanges: function(changes) {
			var domNode = this.domNode;
			changes.forEach(function(change) {
				if (change.type === 'add') {
					var refNode = domNode.children[change.index] || null;
					domNode.insertBefore(change.value.domNode, refNode);
				} else {
					domNode.removeChild(change.value.domNode);
				}
			});
		}
	});
});