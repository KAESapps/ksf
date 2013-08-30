define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/WithDomNode',
	'ksf/dom/WithCssClassStyle'
], function(
	compose,
	ObservableObject,
	WithDomNode,
	WithCssClassStyle
) {
	return compose(
		ObservableObject,
		WithDomNode,
		WithCssClassStyle,
		function(dijit, attrs) {
			this._dijit = dijit;
			this.set('domNode', this._dijit.domNode);
			if (attrs) {
				this.setEach(attrs);
			}
			this.style.asReactive().onValue(this._applyStyle.bind(this));
		},
		{
			_Getter: function(prop) {
				return this._dijit.get(prop);
			},
			_Setter: function(prop, value) {
				this._dijit.set(prop, value);
			},

			updateRendering: function() {
				this._dijit.resize();
			},

			on: function(eventName, callback) {
				if (eventName === 'changed') {
					return ObservableObject.prototype.on.apply(this, arguments);
				}
				return this._dijit.on(eventName, callback);
			}
		}
	);
});