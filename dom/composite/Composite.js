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
				this._applyLayout();
				this._applyStyle();
				this._layout.get('tree').topDown(function(cmp) {
					cmp.updateRendering && cmp.updateRendering();
				});
			},

			startLiveRendering: function() {
				var cancelLiveLayout = this.own(this._layout.on('changed', function() {
					this.updateRendering();
					this.stopLiveRendering();
					this.startLiveRendering();
				}.bind(this)));
				var liveCmps = [];
				this._layout.get('tree').topDown(function(cmp) {
					cmp.startLiveRendering && cmp.startLiveRendering();
					liveCmps.push(cmp);
				});
				this.stopLiveRendering = function() {
					destroy(cancelLiveLayout);
					liveCmps.forEach(function(cmp) {
						cmp.stopLiveRendering && cmp.stopLiveRendering();
					});
					this.stopLiveRendering = undefined;
				}.bind(this);
			}
		}
	);
});