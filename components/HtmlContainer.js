define([
	'compose',
	'ksf/dom/WithOrderedContent',
	'./HtmlElement',
	'ksf/collections/Set',
	'ksf/utils/destroy',
], function(
	compose,
	WithOrderedContent,
	HtmlElement,
	Set,
	destroy
){
	return compose(
		HtmlElement,
		WithOrderedContent,
		{
			updateDom: function() {
				HtmlElement.prototype.updateDom.apply(this);
				this._applyContent();
				this.content.forEach(function(cmp) {
					cmp.updateDom();
				});
			},

			startLiveRendering: function() {
				var self = this,
					liveCancelers = new Set();

				var cancelContentObservation = liveCancelers.updateContentMapR(this.content.asChangesStream(), function(cmp) {
					cmp.startLiveRendering && cmp.startLiveRendering();
					return function() {
						cmp.stopLiveRendering && cmp.stopLiveRendering();
					};
				});

				this.stopLiveRendering = function() {
					cancelContentObservation();
					destroy(liveCancelers);
					delete this.stopLiveRendering;
				};
			}
		}
	);
});