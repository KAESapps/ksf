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
			args && this.setEach(args);
			this._style.set('base', 'LayerContainer');
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
				this.get('domNode').style.position = 'relative';
			},

			_resize: function() {
				var content = this.get('content'),
					thisNode = this.get('domNode'),
					bounds = this.get('bounds'),
					innerSize = this.get('innerSize');

				// innerSize is null when not inserted in DOM, in which case we use values of "bounds"
				if (!innerSize.height && !innerSize.width) {
					if (bounds) {
						innerSize.height = bounds && bounds.height;
						innerSize.width = bounds && bounds.width;
					}
				}

				content.forEach(function(childAndOptions, index) {
					var child = childAndOptions[0],
						options = childAndOptions[1] || {};
					var childNode = child.get('domNode'),
						childWBound, childHBound;

					if (options.verticalAlign !== 'bottom') {
						if (!options.verticalAlign || options.verticalAlign === 'fit') {
							childHBound = innerSize.height;
						}
					}
					if (options.horizontalAlign !== 'right') {
						if (!options.horizontalAlign || options.horizontalAlign === 'fit') {
							childWBound = innerSize.width;
						}
					}
					child.set('bounds', {
						height: childHBound,
						width: childWBound,
						heightMax: innerSize.height,
						widthMax: innerSize.width
					});
				}.bind(this));

				// align children
				content.forEach(function(childAndOptions) {
					var child = childAndOptions[0],
						options = childAndOptions[1];
					var childNode = child.get('domNode');

					if (options && options.verticalAlign === 'middle') {
						var childHeight = child.get('outerSize').height,
							heightMargin = innerSize.height - childHeight;
						childNode.style.top = heightMargin / 2 + 'px';
					}
					if (options && options.horizontalAlign === 'middle') {
						var childWidth = child.get('outerSize').width,
							widthMargin = innerSize.width - childWidth;
						childNode.style.left = widthMargin / 2 + 'px';
					}
				}.bind(this));
			},

			_applyContent: function() {
				var content = this.get('content'),
					thisNode = this.get('domNode');

				// - Content reset -

				// clear children
				thisNode.innerHTML = "";

				this._appliedChildren = new Set();

				var children = document.createDocumentFragment();
				content.forEach(function(childAndOptions, index) {
					var child = childAndOptions[0],
						options = childAndOptions[1] || {};
					var childNode = child.get('domNode');

					childNode.style.position = 'absolute';
					if (options.verticalAlign === 'bottom') {
						childNode.style.bottom = 0;
					} else {
						childNode.style.top = 0;
					}
					if (options.horizontalAlign === 'right') {
						childNode.style.right = 0;
					} else {
						childNode.style.left = 0;
					}

					childNode.style.zIndex = index;

					children.appendChild(childNode);
					this._appliedChildren.add(child);
				}.bind(this));
				// add children in bulk
				thisNode.appendChild(children);

				this._resize();
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
					self._resize();
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