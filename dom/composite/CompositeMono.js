define([
	'compose',
	'../../collections/ObservableObject',
	'../../base/Destroyable',
	'../WithDomNode',
	'ksf/utils/string',
	'ksf/utils/destroy'
], function(
	compose,
	ObservableObject,
	Destroyable,
	WithDomNode,
	str,
	destroy
){
	// c'est un domComponent dont la création du domNode est délégué à un autre domComponent
	// on peut ainsi manipuler ce composant selon l'API KSF au lieu de manipuler directement un domNode natif
	// par contre,

	var init = {};

	return compose(
		ObservableObject,
		Destroyable,
		WithDomNode,
		function() {
			this.style = this._style = new ObservableObject();
		}, {
			_applyBounds: function() {
				var root = this._component;
				root && root.set('bounds', this.get('bounds'));
			},

			_applyStyle: function() {
				this.style.forEach(function(value, category) {
					this._component.style.set(category, value);
				}, this);
			},

			createRendering: function() {
				this._applyStyle();
				this.set('domNode', this._component.get('domNode'));
			},

			updateRendering: function() {
				this._applyStyle();
			},
			destroy: function(){
				Destroyable.prototype.destroy.call(this);
				destroy(this._component);
			},

		}
	);
});