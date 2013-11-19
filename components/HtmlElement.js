define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/WithDomAttributes',
	'ksf/dom/WithCssClassStyle',
	'ksf/dom/Sizeable'
], function(
	compose,
	ObservableObject,
	WithDomAttributes,
	WithCssClassStyle,
	Sizeable
) {
	return compose(
		ObservableObject,
		WithDomAttributes,
		WithCssClassStyle,
		Sizeable,
		function(tag, attrs) {
			this.domNode = document.createElement(tag || 'div');
			if (attrs) {
				this.setEach(attrs);
			}
		},
		{
			set: function(prop, value) {
				if (! this._notAppliedAttrs.has(prop)) {
					this._notAppliedAttrs.add(prop);
				}
				ObservableObject.prototype.set.apply(this, arguments);
			},
			get: function(prop){
				return ObservableObject.prototype.has.call(this, prop) ?
					ObservableObject.prototype.get.apply(this, arguments) :
					this.domNode[prop];
			},
			_Detector: function(prop) {
				return ObservableObject.prototype.has.call(this, prop) || this.domNode.hasOwnProperty(prop);
			},
			updateDom: function() {
				this._applyAttrs();
				this._applyStyle();
				this._applyBounds();
			},
			on: function(eventName, callback) {
				if (eventName === 'changed') {
					return ObservableObject.prototype.on.apply(this, arguments);
				}
				var domNode = this.domNode;
				domNode.addEventListener(eventName, callback);
				return function() {
					domNode.removeEventListener(eventName, callback);
				};
			},

		}
	);
});