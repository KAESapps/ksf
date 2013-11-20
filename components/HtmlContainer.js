define([
	'compose',
	'ksf/dom/WithOrderedContentIncremental',
	'./HtmlElement',
	'ksf/collections/OrderableSet',
	'ksf/utils/destroy',
], function(
	compose,
	WithOrderedContentIncremental,
	HtmlElement,
	OrderableSet,
	destroy
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
					// TODO: liveCancelers could be a simple Set, but there is no updateContentMapR method for the moment.
					liveCancelers = new OrderableSet();

				if (this._liveRendering) {
					throw "Already rendering live";
				} else {
					this._liveRendering = true;
					this._contentChanges.forEach(function(changes) {
						self._applyContentChanges(changes);
					});
					return [
						liveCancelers.updateContentMapR(this.content.asChangesStream(), function(cmp) {
							return cmp.startLiveRendering();
						}),
						liveCancelers.toArray(),
						this._content.asStream('changes').onValue(function(changes) {
							self._applyContentChanges(changes);
						}),
						function() {
							self._liveRendering = false;
							self._contentChanges.clear();
						}
					];
				}
			}
		}
	);
});