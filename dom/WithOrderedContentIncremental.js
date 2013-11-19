define([
	'compose',
	'ksf/collections/OrderableSet',
], function(
	compose,
	OrderableSet
){
	return compose(function() {
		this._content = new OrderableSet();
		this._contentChanges = new OrderableSet();

		this._content.asStream("changes").onValue(function(changes) {
			this._contentChanges.add(changes);
		}.bind(this));
	}, {
		_applyChanges: function() {
			var self = this,
				domNode = this.domNode;
			this._contentChanges.forEach(function(changes) {
				changes.forEach(function(change) {
					if (change.type === 'add') {
						var refNode = domNode.children[change.index] || null;
						domNode.insertBefore(change.value.domNode, refNode);
					} else {
						domNode.removeChild(change.value.domNode);
					}
				});
			});
			this._contentChanges.clear();
		}
	});
});