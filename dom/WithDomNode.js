define([
], function(
){
	return {
		_domNodeGetter: function() {
			if (!this.has('domNode')) {
				// create node if not rendered yet
				this.createRendering();
			}
			return this._domNode;
		},
		_domNodeDetector: function() {
			return '_domNode' in this;
		},
		_domNodeSetter: function(domNode) {
			this._domNode = domNode;
		},
		_domNodeRemover: function() {
			delete this._domNode;
		},

		_outerSizeGetter: function() {
			var node = this.get('domNode');
			return {
				height: node.offsetHeight,
				width: node.offsetWidth
			};
		}
	};
});