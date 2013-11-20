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

	var CompositeMono = compose(
		ObservableObject,
		Destroyable,
		{
			_sizeGetter: function() {
				return this._component.get('size');
			},

			_applyBounds: function() {
				this._component.set('bounds', this.get('bounds'));
			},

			startLiveRendering: function() {
				return [
					this._component.startLiveRendering(),
					this.getR('bounds').onValue(this._applyBounds.bind(this))
				];
			},

			destroy: function(){
				Destroyable.prototype.destroy.call(this);
				destroy(this._component);
			}
		}
	);

	Object.defineProperty(CompositeMono.prototype, 'domNode', {
		get: function() {
			return this._component.domNode;
		}
	});
	Object.defineProperty(CompositeMono.prototype, '_style', {
		get: function() {
			return this._component.style;
		}
	});
	Object.defineProperty(CompositeMono.prototype, 'style', {
		get: function() {
			return this._component.style;
		}
	});

	return CompositeMono;
});