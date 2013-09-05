define([
	'ksf/collections/OrderableSet',
], function(
	OrderableSet
){
	// mixin qui implemnte l'API orderedContent pour un HtmlElement
	// l'API "orderedContent" expose une méthode 'set("content", orderedListOfComponents)'
	// 'orderedListOfComponents' est une collection ordonnée de composants uniques
	// on ne s'occupe pas de l'objet 'orderedListOfComponents' lui-même mais de son contenu : les composants et leur ordre
	// par contre l'objet retourné par "get('content')" est un réactif incrémental, c'est à dire qui supporte "updateContent" et "updateContentR"
	var WithIncrementalContentRendering = function(){
		this._content = new OrderableSet();

		this._content.asStream("changes").onValue(this._applyContentChanges.bind(this));
	};
	WithIncrementalContentRendering.prototype = {
		_applyContentChanges: function(changes) {
			var domNode = this.get('domNode');
			changes.forEach(function(change) {
				if (change.type === 'add') {
					var refNode = domNode.children[change.index] || null;
					domNode.insertBefore(change.value.get('domNode'), refNode);
					if (this._liveRendering) {
						change.value.startLiveRendering && change.value.startLiveRendering();
					}
				} else {
					domNode.removeChild(change.value.get('domNode'));
					if (this._liveRendering) {
						change.value.stopLiveRendering && change.value.stopLiveRendering();
					}
				}
			});
		},
		_contentSetter: function(cmps){
			this.get("content").setContent(cmps);
		},
		_contentGetter: function(){
			return this._content;
		},
		updateRendering: function() {
			this.get('content').forEach(function(cmp) {
				cmp.updateRendering && cmp.updateRendering();
			});
		},
		startLiveRendering: function() {
			var cancel = this.get('content').asChangesStream().onValue(function(changes) {
				changes.forEach(function(change) {
					var cmp = change.value;
					if (change.type === 'add') {
						cmp.startLiveRendering && cmp.startLiveRendering();
					} else {
						cmp.stopLiveRendering && cmp.stopLiveRendering();
					}
				});
			});

			this.stopLiveRendering = function() {
				cancel();
				this.get('content').forEach(function(cmp) {
					cmp.stopLiveRendering && cmp.stopLiveRendering();
				});
				this._liveRendering = true;
				delete this.stopLiveRendering;
			};

			this._liveRendering = true;
		}
	};

	return WithIncrementalContentRendering;
});