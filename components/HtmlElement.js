define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/WithHTMLElement',
	'ksf/dom/WithCssClassStyle'
], function(
	compose,
	ObservableObject,
	WithHTMLElement,
	WithCssClassStyle
) {
	return compose(
		ObservableObject,
		WithHTMLElement,
		WithCssClassStyle,
		function(tag, attrs) {
			this._tag = tag;
			this.createRendering();
			if (attrs) {
				this.setEach(attrs);
			}
			this.style.asReactive().onValue(this._applyStyle.bind(this));
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