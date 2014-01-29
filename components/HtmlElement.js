define([
	'compose',
	'dojo/has',
	'ksf/collections/ObservableObject',
	'ksf/collections/Set',
	'ksf/dom/WithCssClasses',
	'ksf/dom/WithStyle',
	'ksf/dom/WithSize',
	'ksf/dom/Sizeable'
], function(
	compose,
	has,
	ObservableObject,
	Set,
	WithCssClasses,
	WithStyle,
	WithSize,
	Sizeable
) {
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
			readDomAttrs: function() {
				var domNode = this._domNode;
				var domValues = {};
				this._startChanges();
				Array.prototype.forEach.call(arguments, function(attr) {
					this.set(attr, domNode[attr]);
				}, this);
				this._stopChanges(this);
			},
		}
	);

	return compose(
		ObservableObject,
		WithCssClasses,
		WithStyle,
		WithSize,
		Sizeable,
		function(tag, domAttrs, props, domEvents) {
			var self = this;
			var domNode = this.domNode = document.createElement(tag || 'div');
			// ideally, we would only expose DomNodeProxy's methods that should be part of the API (.domAttrs.get/set/setEach)
			var domProxy = this.domAttrs = this._domProxy = new DomNodeProxy(this.domNode);

			if (domAttrs) {
				this.domAttrs.setEach(domAttrs);
			}
			if (props) {
				this.setEach(props);
			}
			if (domEvents) {
				Object.keys(domEvents).forEach(function(eventName) {
					var cb = function() {
						domProxy.readDomAttrs(domEvents[eventName]);
					};
					domNode.addEventListener(eventName, cb);
					self.own(function() {
						domNode.removeEventListener(eventName, cb);
					});
				});
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
						this._domProxy.asStream("changed").toProperty({}).onValue(function(ev) {
							if (ev.origin !== self._domProxy) {
								self._applyAttrs();
							}
						}),
						this.getR('bounds').onValue(function() {
							self._applyBounds();
						}),
						this.cssClasses.asReactive().onValue(function() {
							self._applyCssClasses();
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

			readDomAttrs: function(attrs) {
				return this._domProxy.readDomAttrs(attrs);
			},
		}
	);
});