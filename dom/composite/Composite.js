define([
	'compose',
	'../../base/Composite',
	'../../collections/ObservableObject',
	'./CompositeMono',
	'./LayoutManager',
	'ksf/utils/string',
	'ksf/utils/destroy'
], function(
	compose,
	CompositeBase,
	ObservableObject,
	CompositeMono,
	LayoutManager,
	str,
	destroy
){
	// c'est un domComponent dont la création du domNode est délégué à d'autres domComponents
	// on peut ainsi se contenter de manipuler les composants selon l'API KSF au lieu de manipuler directement des domNodes
	// c'est pourquoi il a l'outillage pour manipuler des composants : componentsRegistry et layoutManager
	var CustomCompositeMono = CompositeMono.custom({ mainComponentPropName: '_root' });
	var Composite = compose(
		CustomCompositeMono,
		CompositeBase,
		function() {
			this._layout = new LayoutManager({ registry: this._components });

			this._components.asChangesStream().onValue(function(changes) {
				changes.forEach(function(change) {
					if (change.type === 'add') {
						change.value.cssClasses && change.value.cssClasses.set('name', str.hyphenate(change.key));
					} else if (change.type === 'remove') {
						change.value.cssClasses && change.value.cssClasses.remove('name');
					}
				});
			});
		}, {
			_applyLayout: function() {
				this._layout.set('root', this._root);
				this._layout.apply();
			},

			startLiveRendering: function() {
				var self = this;
				return [
					CustomCompositeMono.prototype.startLiveRendering.apply(this),
					this._layout.getR('config').onValue(function() {
						self._applyLayout();
					})
				];
			}
		}
	);

	return Composite;
});