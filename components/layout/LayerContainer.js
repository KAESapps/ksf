define([
	'compose',
	'ksf/utils/CoupleElementOptions',
	'./OrderedContainerBase',
], function(
	compose,
	CoupleElementOptions,
	OrderedContainerBase
) {
	return compose(
		OrderedContainerBase,
		function(args) {
			this.domNode.style.position = 'relative';
			this.style.set('base', 'LayerContainer');
		}, {
			_layoutContent: function() {
				var content = this.content.map(CoupleElementOptions.fromLiteral),
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
					var child = childAndOptions.element,
						options = childAndOptions.options;
					var childStyle = child.domNode.style,
						childBounds = child.get('bounds') || {},
						childWBound, childHBound;

					childStyle.position = options.sizeReference ? 'relative' : 'absolute';
					childStyle.zIndex = index;

					if (options.verticalAlign === 'bottom') {
						childStyle.bottom = 0;
					} else {
						childStyle.top = 0;
					}
					if (!options.verticalAlign || options.verticalAlign === 'fit') {
						childHBound = innerSize.height;
					} else {
						childHBound = childBounds.height;
					}

					if (options.horizontalAlign === 'right') {
						childStyle.right = 0;
					} else {
						childStyle.left = 0;
					}
					if (!options.horizontalAlign || options.horizontalAlign === 'fit') {
						childWBound = innerSize.width;
					} else {
						childWBound = childBounds.width;
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
					var child = childAndOptions.element,
						options = childAndOptions.options;
					var childStyle = child.domNode.style;

					if (options && options.verticalAlign === 'middle') {
						var childHeight = child.get('size').height,
							heightMargin = innerSize.height - childHeight;
						childStyle.top = heightMargin / 2 + 'px';
					}
					if (options && options.horizontalAlign === 'middle') {
						var childWidth = child.get('size').width,
							widthMargin = innerSize.width - childWidth;
						childStyle.left = widthMargin / 2 + 'px';
					}
				}.bind(this));
			},

			startLiveRendering: function() {
				var self = this;
				return [
					OrderedContainerBase.prototype.startLiveRendering.apply(this),
					this.getR('bounds').onValue(function() {
						self._layoutContent();
					}),
					// we subscribed to this same stream in the constructor
					// so the children should be inserted into the DOM before we execute sizeContent()
					this.content.asStream('changes').onValue(function() {
						self._layoutContent();
					})
				];
			}
		}
	);
});