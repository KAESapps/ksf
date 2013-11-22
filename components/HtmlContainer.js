define([
	'compose',
	'ksf/dom/WithOrderedContentIncremental',
	'./HtmlElement',
	'ksf/collections/OrderableSet'
], function(
	compose,
	WithOrderedContentIncremental,
	HtmlElement,
	OrderableSet
){
	return compose(
		HtmlElement,
		WithOrderedContentIncremental,
		function() {
			this.content = this._content = new OrderableSet();
			this._contentChanges = new OrderableSet();
			// TODO: stop storing changes when liveRendering
			this._content.asStream('changes').onValue(function(changes) {
				this._contentChanges.add(changes);
			}.bind(this));
		}, {
			startLiveRendering: function() {
				var self = this,
					// TODO: liveCancelers could be a simple Set, but there is no updateContentMapR method on a Set for the moment.
					liveCancelers = new OrderableSet();

				this._contentChanges.forEach(function(changes) {
					self._applyContentChanges(changes);
				});
				return [
					HtmlElement.prototype.startLiveRendering.apply(this),
					liveCancelers.updateContentMapR(this.content.asChangesStream(), function(cmp) {
						return cmp.startLiveRendering();
					}),
					liveCancelers.toArray(),
					this._content.asStream('changes').onValue(function(changes) {
						self._applyContentChanges(changes);
					}),
					function() {
						self._contentChanges.clear();
					}
				];
			},
			_inDomSetter: function(inDom) {
				this._Setter('inDom', inDom);
				this._appliedContent.forEach(function(cmp) {
					cmp.set('inDom', inDom);
				});
			},
		}
	);
});