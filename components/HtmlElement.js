define([
	'compose',
	'dojo/has',
	'ksf/collections/ObservableObject',
	'ksf/dom/WithCssClassStyle',
	'ksf/dom/Sizeable'
], function(
	compose,
	has,
	ObservableObject,
	WithCssClassStyle,
	Sizeable
) {
	//
	var DomNodeProxy = compose(
		ObservableObject,
		function(domNode) {
			this._domNode = domNode;
			this._notAppliedAttrs = new Set();
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
					this._domNode[prop];
			},
			has: function(prop) {
				return ObservableObject.prototype.has.call(this, prop) || this._domNode.hasOwnProperty(prop);
			},
			applyAttrs: function() {
				var domNode = this._domNode;
				this._notAppliedAttrs.forEach(function(attr) {
					domNode[attr] = this.get(attr);
				}.bind(this));
				this._notAppliedAttrs.clear();
			},
		}

	);

	return compose(
		ObservableObject,
		WithCssClassStyle,
		Sizeable,
		function(tag, domAttrs, props) {
			this.domNode = document.createElement(tag || 'div');
			// ideally, we would only expose DomNodeProxy's methods that should be part of the API (.domAttrs.get/set/setEach)
			this.domAttrs = this._domProxy = new DomNodeProxy(this.domNode);

			if (domAttrs) {
				this.domAttrs.setEach(domAttrs);
			}
			if (props) {
				this.setEach(props);
			}
		},
		{

			startLiveRendering: function() {
				var self = this;
				if (this._liveRendering) {
					throw "Already rendering live";
				} else {
					this._liveRendering = true;
					return [
						this._domProxy.asReactive().onValue(function() {
							self._applyAttrs();
						}),
						this.getR('bounds').onValue(function() {
							self._applyBounds();
						}),
						this.style.asReactive().onValue(function() {
							self._applyStyle();
						}),
						function() {
							self._liveRendering = false;
						}
					];
				}
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

			_applyAttrs: function() {
				if (has('ksf-monitoring')) {
					console.time("apply attrs");
				}

				this._domProxy.applyAttrs();

				if (has('ksf-monitoring')) {
					console.timeEnd("apply attrs");
				}

			},

		}
	);
});