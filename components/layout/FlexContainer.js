define([
	'compose',
	'../ContainerBase',
	'ksf/dom/Sizeable',
	'ksf/dom/WithInnerSize',
	'ksf/utils/destroy',
	'collections/shim-array'
], function(
	compose,
	Container,
	Sizeable,
	WithInnerSize,
	destroy
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

			__verticalGetter: function() {
				return this.get('orientation') !== 'horizontal';
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
					vertical = this.get('_vertical'),
					fixedDim = 0,
					flexChildren = [];

				// innerSize is null when not inserted in DOM, in which case we use values of "bounds"
				if (!innerSize.height && !innerSize.width) {
					if (bounds) {
						innerSize = {
							height: bounds && bounds.height,
							width: bounds && bounds.width
						};
					}
				}

				// - Content reset -

				// clear children
				thisNode.innerHTML = "";
				// cancel listeners
				this._handlers.forEach(function(handler) {
					destroy(handler);
				});
				this._handlers = [];

				var children = document.createDocumentFragment();
				content.forEach(function(childAndOptions) {
					var child = childAndOptions[0],
						options = childAndOptions[1];
					var childNode = child.get('domNode');

					child.set('bounds', {});
					child.updateRendering && child.updateRendering();
					if (options && options.flex) {
						flexChildren.add(childAndOptions);
					}

					childNode.style.display = vertical ? 'block' : 'inline-block';
					childNode.style.verticalAlign = 'top';
					childNode.style.boxSizing = 'border-box';
					childNode.style.MozBoxSizing = 'border-box';

					children.appendChild(childNode);
				});
				// add children in bulk
				thisNode.appendChild(children);

				// - Sizing of flex children -
				content.forEach(function(childAndOptions) {
					var child = childAndOptions[0],
						options = childAndOptions[1];

					if (!options || !options.flex) {
						if (vertical) {
							child.set('bounds', {
								width: innerSize.width
							});
							child.updateRendering && child.updateRendering();
							fixedDim += child.get('outerSize').height;
						} else {
							child.set('bounds', {
								height: innerSize.height
							});
							child.updateRendering && child.updateRendering();
							fixedDim += child.get('outerSize').width;
						}
					}
				});

				var flexDim = ((vertical ? innerSize.height : innerSize.width) - fixedDim) / flexChildren.length;

				flexChildren.forEach(function(childAndOptions) {
					var child = childAndOptions[0];
					if (vertical) {
						child.set('bounds', {
							height: flexDim,
							width: innerSize.width
						});
					} else {
						child.set('bounds', {
							height: innerSize.height,
							width: flexDim
						});
					}
					child.updateRendering && child.updateRendering();
				}.bind(this));

				content.forEach(function(childAndOptions) {
					var child = childAndOptions[0];
					this._handlers.push(child.on('sizechanged', function() {
						this.updateRendering();
					}.bind(this)));
				}.bind(this));
			},

			updateRendering: function() {
				this._applyBounds();
				Container.prototype.updateRendering.apply(this, arguments);
				this._applyContent();
			}
		}
	);
});