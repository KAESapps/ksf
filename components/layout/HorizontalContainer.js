define([
	'compose',
	'./ContainerBase',
	'ksf/dom/Sizeable',
	'ksf/dom/WithInnerSize',
	'ksf/utils/destroy',
	'ksf/collections/Set'
], function(
	compose,
	Container,
	Sizeable,
	WithInnerSize,
	destroy,
	Set
) {
	return compose(
		Container,
		Sizeable,
		WithInnerSize,
		function(args) {
			this._handlers = [];
			args && this.setEach(args);
		},
		{
			_contentGetter: function(content) {
				return this._content || [];
			},
			_contentSetter: function(content) {
				this._content = content.map(function(item) {
					return (item instanceof Array) ? item : [item];
				});
			},

			createRendering: function() {
				Container.prototype.createRendering.apply(this, arguments);
				this.updateRendering();
			},

			_applyContent: function() {
				var content = this.get('content'),
					bounds = this.get('bounds'),
					thisNode = this.get('domNode'),
					innerSize = this.get('innerSize'),
					innerHeight,
					liveRendering = this.stopLiveRendering;

				// innerSize is null when not inserted in DOM, in which case we use values of "bounds"
				if (!innerSize.height && !innerSize.width) {
					if (bounds) {
						innerHeight = bounds && bounds.height;
					}
				} else {
					innerHeight = innerSize.height;
				}

				// - Content reset -

				// clear children
				thisNode.innerHTML = "";
				// cancel listeners
				this._handlers.forEach(function(handler) {
					destroy(handler);
				});
				this._handlers = [];

				this._appliedChildren = new Set();

				var children = document.createDocumentFragment();
				content.forEach(function(childAndOptions) {
					var child = childAndOptions[0],
						options = childAndOptions[1];
					var childNode = child.get('domNode');

					childNode.style.display = 'inline-block';
					childNode.style.position = 'relative';
					childNode.style.boxSizing = 'border-box';
					childNode.style.MozBoxSizing = 'border-box';

					children.appendChild(childNode);
					this._handlers.push(child.on('sizechanged', function() {
						this._applyContent();
					}.bind(this)));

					this._appliedChildren.add(child);
				}.bind(this));
				// add children in bulk
				thisNode.appendChild(children);

				// align children
				content.forEach(function(childAndOptions) {
					var child = childAndOptions[0],
						options = childAndOptions[1];
					var childNode = child.get('domNode');

					if (options && options.verticalAlign) {
						var childHeight = child.get('outerSize').height,
							margin = innerHeight - childHeight;
						if (options.verticalAlign === 'middle') {
							childNode.style.top = margin / 2 + 'px';
						} else if (options.verticalAlign === 'bottom') {
							childNode.style.top = margin;
						}
					}
				}.bind(this));
			},

			updateRendering: function() {
				this._applyBounds();
				Container.prototype.updateRendering.apply(this, arguments);
				this._applyContent();
			},

			startLiveRendering: function() {
				var self = this,
					cancels = [],
					liveChildren = new Set();

				cancels.push(this.getR('bounds').onValue(function() {
					self._applyBounds();
					self._applyContent();
				}));

				cancels.push(this.style.asReactive().onValue(this._applyStyle.bind(this)));

				this._appliedChildren.forEach(function(child) {
					child.startLiveRendering && child.startLiveRendering();
					liveChildren.add(child);
				});

				cancels.push(this.getR('content').changes().onValue(function() {
					self._applyContent();
					self._appliedChildren.difference(liveChildren).forEach(function(child) {
						child.startLiveRendering && child.startLiveRendering();
						liveChildren.add(child);
					});
					liveChildren.difference(self._appliedChildren).forEach(function(child) {
						child.stopLiveRendering && child.stopLiveRendering();
						liveChildren.remove(child);
					});
				}));

				this.stopLiveRendering = function() {
					cancels.forEach(function(cancel) {
						cancel();
					});
					liveChildren.forEach(function(child) {
						child.stopLiveRendering && child.stopLiveRendering();
					});
					delete this.stopLiveRendering;
				};
			}
		}
	);
});