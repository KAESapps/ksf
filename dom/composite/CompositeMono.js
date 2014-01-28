define([
	'compose',
	'../../collections/ObservableObject',
	'../../base/Destroyable',
	'ksf/utils/string',
	'ksf/utils/destroy'
], function(
	compose,
	ObservableObject,
	Destroyable,
	str,
	destroy
){
	// c'est un domComponent dont la création du domNode est délégué à un autre domComponent
	// on peut ainsi manipuler ce composant selon l'API KSF au lieu de manipuler directement un domNode natif
	// par contre,

	var generator = function(args) {
		var MAIN_COMPONENT = args.mainComponentPropName;

		var CompositeMono = compose(
			ObservableObject,
			Destroyable,
			{
				_sizeGetter: function() {
					return this[MAIN_COMPONENT].get('size');
				},

				_applyBounds: function() {
					this[MAIN_COMPONENT].set('bounds', this.get('bounds'));
				},

				_inDomSetter: function(inDom) {
					this[MAIN_COMPONENT].set('inDom', inDom);
				},
				_inDomGetter: function() {
					return this[MAIN_COMPONENT].get('inDom');
				},

				startLiveRendering: function() {
					return [
						this[MAIN_COMPONENT].startLiveRendering(),
						this.getR('bounds').onValue(this._applyBounds.bind(this))
					];
				},

				readDomAttrs: function(attrs) {
					return this[MAIN_COMPONENT].readDomAttrs(attrs);
				},

				destroy: function(){
					Destroyable.prototype.destroy.call(this);
					destroy(this[MAIN_COMPONENT]);
				}
			}
		);

		Object.defineProperty(CompositeMono.prototype, 'domNode', {
			get: function() {
				return this[MAIN_COMPONENT].domNode;
			}
		});
		Object.defineProperty(CompositeMono.prototype, 'cssClasses', {
			get: function() {
				return this[MAIN_COMPONENT].cssClasses;
			}
		});
		Object.defineProperty(CompositeMono.prototype, 'style', {
			get: function() {
				return this[MAIN_COMPONENT].style;
			}
		});
		return CompositeMono;
	};

	var CompositeMono = generator({ mainComponentPropName: '_component' });
	CompositeMono.custom = generator;

	return CompositeMono;
});