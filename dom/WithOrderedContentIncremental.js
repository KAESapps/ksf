define([
	'compose'
], function(
	compose
){
	return compose({
		_applyContentChanges: function(changes) {
			// v----rendering log----v
			var timer = "apply content";
			if (window.renderingLog) {
				console.time(timer);
			}
			// ^----rendering log----^

			var domNode = this.domNode;
			changes.forEach(function(change) {
				if (change.type === 'add') {
					var refNode = domNode.children[change.index] || null;
					domNode.insertBefore(change.value.domNode, refNode);
				} else {
					domNode.removeChild(change.value.domNode);
				}
			});

			// v----rendering log----v
			console.timeEnd(timer);
			// ^----rendering log----^

		}
	});
});