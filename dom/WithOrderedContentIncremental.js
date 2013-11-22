define([
	'compose'
], function(
	compose
){
	return compose(function() {
		this._appliedContent = [];
	},
	{
		_applyContentChanges: function(changes) {
			// v----rendering log----v
			var timer = "apply content";
			if (window.renderingLog) {
				console.time(timer);
			}
			// ^----rendering log----^

			var domNode = this.domNode;
			var inDom = this.get('inDom');
			var appliedContent = this._appliedContent;
			changes.forEach(function(change) {
				if (change.type === 'add') {
					var refNode = domNode.children[change.index] || null;
					domNode.insertBefore(change.value.domNode, refNode);
					change.value.set('inDom', inDom);
					appliedContent.push(change.value);
				} else {
					domNode.removeChild(change.value.domNode);
					change.value.set('inDom', false);
					appliedContent.splice(appliedContent.indexOf(change.value), 1);
				}
			});

			// v----rendering log----v
			console.timeEnd(timer);
			// ^----rendering log----^

		}
	});
});