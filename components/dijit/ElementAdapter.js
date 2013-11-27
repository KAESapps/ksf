define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/Sizeable',
	'ksf/dom/WithCssClassStyle'
], function(
	compose,
	ObservableObject,
	Sizeable,
	WithCssClassStyle
) {
	return compose(
		ObservableObject,
		Sizeable,
		WithCssClassStyle,
		function(dijit, attrs) {
			this._dijit = dijit;
			this.domNode = this._dijit.domNode;
			if (attrs) {
				this.setEach(attrs);
			}
		}, {
			_Getter: function(prop) {
				return this._dijit.get(prop);
			},
			_Setter: function(prop, value) {
				this._dijit.set(prop, value);
			},

			_dijitResize: function() {
				this._dijit.resize();
			},

			on: function(eventName, callback) {
				if (eventName === 'changed') {
					return ObservableObject.prototype.on.apply(this, arguments);
				}
				return this._dijit.on(eventName, callback);
			},

			startLiveRendering: function() {
				var self = this;
				return [
					this.style.asReactive().onValue(this._applyStyle.bind(this)),
					this.getEachR('inDom', 'bounds').onValue(function() {
						self._applyBounds();
						self._dijitResize();
					})
				];
			}
		}
	);
});