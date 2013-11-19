define([
	'compose',
	'ksf/dom/WithOrderedContentIncremental',
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
		function() {
			this.content = this._content;
		}, {
			updateDom: function() {
				HtmlElement.prototype.updateDom.apply(this);
				this._applyChanges();
				this._content.forEach(function(cmp) {
					cmp.updateDom();
				});
			},

			startLiveRendering: function() {
				var self = this,
					liveCancelers = new Set();

				var cancelContentObservation = liveCancelers.updateContentMapR(this.content.asChangesStream(), function(cmp) {
					var stopLiveRendering = cmp.startLiveRendering && cmp.startLiveRendering();
					return stopLiveRendering && function() {
						stopLiveRendering();
					};
				});

				return function() {
					cancelContentObservation();
					destroy(liveCancelers);
				};
			}
		}
	);
});