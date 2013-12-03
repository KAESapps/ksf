define([
	'compose',
	'./OrderedContainerBase'
], function(
	compose,
	OrderedContainerBase
) {
	return compose(
		OrderedContainerBase,
		function(args) {
			this.style.set('base', 'FlowContainer');
		}, {
			_layoutContent: function() {
				this.content.forEach(function(child) {
					child.set('bounds', {});
				}.bind(this));
			},

			startLiveRendering: function() {
				var self = this;
				return [
					OrderedContainerBase.prototype.startLiveRendering.apply(this),
					this.getEachR('inDom', 'bounds').onValue(function() {
						if (self.get('inDom')) {
							self._layoutContent();
						}
					}),
					// we subscribed to this same stream in the constructor
					// so the children should be inserted into the DOM before we execute sizeContent()
					this.content.asStream('changes').onValue(function() {
						self._layoutContent();
					})
				];
			}
		}
	);
});