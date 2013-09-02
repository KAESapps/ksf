define([
	'compose',
	'../../base/Composite',
	'../../collections/ObservableObject',
	'../WithDomNode',
	'./LayoutManager',
	'ksf/utils/string',
	'ksf/utils/destroy'
], function(
	compose,
	CompositeBase,
	ObservableObject,
	WithDomNode,
	LayoutManager,
	str,
	destroy
){
	// c'est un domComponent dont la création du domNode est délégué à d'autres domComponents
	// on peut ainsi se contenter de manipuler les composants selon l'API KSF au lieu de manipuler directement des domNodes
	// c'est pourquoi il a l'outillage pour manipuler des composants : componentsRegistry et layoutManager

	return compose(
		CompositeBase,
		WithDomNode,
		function() {
			this._layout = new LayoutManager({ registry: this._components });

			this.style = this._style = new ObservableObject();
			this._components.asChangesStream().onValue(function(changes) {
				changes.forEach(function(change) {
					if (change.type === 'add') {
						change.value.style && change.value.style.set('name', str.hyphenate(change.key));
					} else if (change.type === 'remove') {
						change.value.style && change.value.style.remove('name');
					}
				});
			});
		}, {
			_applyBounds: function() {
				var root = this._layout.get('root');
				root && root.set('bounds', this.get('bounds'));
			},

			_applyLayout: function() {
				this._layout.apply();
				this._applyBounds();
			},

			_applyStyle: function() {
				this.style.forEach(function(value, category) {
					this._layout.get('root').style.set(category, value);
				}, this);
			},

			createRendering: function() {
				this._applyLayout();
				this._applyStyle();
				this.set('domNode', this._layout.get('root').get('domNode'));
			},

			updateRendering: function() {
				if (!this._domNode) { return; }

				this._applyLayout();
				this._applyStyle();
				this._layout.get('root').updateRendering();
			},

			startLiveRendering: function() {
				var root = this._layout.get('root');
				root.startLiveRendering && root.startLiveRendering();
				var cancelLiveLayout = this.own(this._layout.getR('config').onValue(function() {
					var liveRendering = this._liveRendering;
					liveRendering && this.stopLiveRendering();
					this._applyLayout();
					liveRendering && this.startLiveRendering();
				}.bind(this)));
				var cancelStyle = this._style.asReactive().onValue(this._applyStyle.bind(this));
				var cancelSize = this.getR('bounds').onValue(this._applyBounds.bind(this));

				this.stopLiveRendering = function() {
					cancelLiveLayout();
					cancelStyle();
					cancelSize();
					root.stopLiveRendering && root.stopLiveRendering();
					this.stopLiveRendering = undefined;
					this._liveRendering = false;
				};
				this._liveRendering = true;
			}
		}
	);
});