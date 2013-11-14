define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/WithHTMLElement',
	'ksf/dom/WithCssClassStyle',
	'ksf/dom/Sizeable'
], function(
	compose,
	ObservableObject,
	WithHTMLElement,
	WithCssClassStyle,
	Sizeable
) {
	return compose(
		ObservableObject,
		WithHTMLElement,
		WithCssClassStyle,
		Sizeable,
		function(tag, attrs) {
			this._tag = tag || 'div';
			this.createRendering();
			if (attrs) {
				this.setEach(attrs);
			}
			this.style.asReactive().onValue(this._applyStyle.bind(this));
			this.getR('bounds').onValue(this._applyBounds.bind(this));
		},
		{
			_Getter: function(prop) {
				return this._domNode[prop];
			},
			_Setter: function(prop, value) {
				this._applyDomAttr(prop, value);
			},
			_Detector: function(prop){
				return this._domNode.hasOwnProperty(prop);
			},

			on: function(eventName, callback) {
				if (eventName === 'changed') {
					return ObservableObject.prototype.on.apply(this, arguments);
				}
				var domNode = this.get('domNode');
				domNode.addEventListener(eventName, callback);
				return function() {
					domNode.removeEventListener(eventName, callback);
				};
			}
		}
	);
});