define([
	'compose',
	'dojo/has',
	'ksf/utils/CoupleElementOptions',
	'./OrderedContainerBase',
], function(
	compose,
	has,
	CoupleElementOptions,
	OrderedContainerBase
) {
	return compose(
		OrderedContainerBase,
		function(args) {
			this._style.set('base', 'FlexContainer');
			if (has('ksf-monitoring')) {
				this._monitoring = {
					name: this.get('name') + ' (FlexContainer)'
				};
			}
		}, {
			_alignGetter: function() {
				return this._Getter('align') || 'top';
			},

			__verticalGetter: function() {
				return this.get('orientation') !== 'horizontal';
			},

			_layoutContent: function() {
				// v----rendering log----v
				if (has('ksf-monitoring')) {
					var layoutTimer = this._monitoring.layoutTimer = this._monitoring.name + " layouting";
					console.groupCollapsed(layoutTimer);
					console.time(layoutTimer);
				}
				// ^----rendering log----^

				var self = this,
					bounds = this.get('bounds'),
					innerSize = this.get('innerSize'),
					vertical = this.get('_vertical'),
					align = this.get('align'),
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

				var content = this.content.map(CoupleElementOptions.fromLiteral);

				content.forEach(function(childAndOptions) {
					var child = childAndOptions.element,
						options = childAndOptions.options,
						childNode = child.domNode;

					if (options && (options.flex || options.flexMax)) {
						flexChildren.push(childAndOptions);
					}

					childNode.style.display = vertical ? 'block' : 'inline-block';
					childNode.style.verticalAlign = align;
					childNode.style.boxSizing = 'border-box';
					childNode.style.MozBoxSizing = 'border-box';
				}.bind(this));

				// - Sizing of flex children -
				content.forEach(function(childAndOptions) {
					var child = childAndOptions.element,
						options = childAndOptions.options;

					// v----rendering log----v
					if (has('ksf-monitoring')) {
						self._monitoring.childSizingTimer = child.get('name') + " sizing (not flex)";
						console.time(self._monitoring.childSizingTimer);
					}
					// ^----rendering log----^

					if (!options || (!options.flex && !options.flexMax)) {
						if (vertical) {
							child.set('bounds', {
								width: bounds && bounds.width && innerSize.width
							});
							fixedDim += child.get('size').height;
						} else {
							child.set('bounds', {
								height: bounds && bounds.height && innerSize.height
							});
							fixedDim += child.get('size').width;
						}
					}

					// v----rendering log----v
					if (has('ksf-monitoring')) {
						console.timeEnd(self._monitoring.childSizingTimer);
					}
					// ^----rendering log----^
				});

				var flexDim = ((vertical ? innerSize.height : innerSize.width) - fixedDim) / flexChildren.length;

				flexChildren.forEach(function(childAndOptions) {
					var child = childAndOptions.element,
						options = childAndOptions.options,
						childBounds;

					// v----rendering log----v
					if (has('ksf-monitoring')) {
						this._monitoring.childSizingTimer = child.get('name') + " sizing (flex)";
						console.time(self._monitoring.childSizingTimer);
					}
					// ^----rendering log----^


					if (vertical) {
						childBounds = {
							width: bounds && bounds.width && innerSize.width
						};
						if (options.flexMax) {
							childBounds['heightMax'] = flexDim;
						} else {
							childBounds['height'] = flexDim;
						}
					} else {
						childBounds = {
							height: bounds && bounds.height && innerSize.height
						};
						if (options.flexMax) {
							childBounds['widthMax'] = flexDim;
						} else {
							childBounds['width'] = flexDim;
						}
					}
					child.set('bounds', childBounds);


					// v----rendering log----v
					if (has('ksf-monitoring')) {
						console.timeEnd(self._monitoring.childSizingTimer);
					}
					// ^----rendering log----^


				}.bind(this));

				// v----rendering log----v
				if (has('ksf-monitoring')) {
					console.timeEnd(this._monitoring.layoutTimer);
					console.groupEnd();
				}
				// ^----rendering log----^
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