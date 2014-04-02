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
			this.style.set('base', 'FlexContainer');
			if (has('ksf-monitoring')) {
				this._monitoring = {
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
				if (! this.get('inDom')) {
					return;
				}

				if (has('ksf-monitoring')) {
					var layoutTimer = this._monitoring.layoutTimer = this.style.get('name') + ' (FlexContainer)' + " layouting";
					console.groupCollapsed(layoutTimer);
					console.time(layoutTimer);
				}

				var self = this,
					bounds = this.get('bounds'),
					innerSize = this.get('innerSize'),
					vertical = this.get('_vertical'),
					align = this.get('align'),
					fixedDim = 0,
					flexChildren = [];

				var content = this.content.map(CoupleElementOptions.fromLiteral);

				content.forEach(function(childAndOptions) {
					var child = childAndOptions.element,
						options = childAndOptions.options,
						childNode = child.domNode;

					if (options && (options.flex || options.flexMax)) {
						flexChildren.push(childAndOptions);
					}

					childNode.style.position = 'relative';
					childNode.style.display = vertical ? 'block' : 'inline-block';
					childNode.style.verticalAlign = align;
					childNode.style.boxSizing = 'border-box';
					childNode.style.MozBoxSizing = 'border-box';
				}.bind(this));

				// - Sizing of flex children -
				content.forEach(function(childAndOptions) {
					var child = childAndOptions.element,
						options = childAndOptions.options;

					if (!options || (!options.flex && !options.flexMax)) {

						if (has('ksf-monitoring')) {
							self._monitoring.childSizingTimer = child.style.get('name') + " sizing (not flex)";
							console.groupCollapsed(self._monitoring.childSizingTimer);
							console.time(self._monitoring.childSizingTimer);
						}

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

						if (has('ksf-monitoring')) {
							console.timeEnd(self._monitoring.childSizingTimer);
							console.groupEnd();
						}
					}

				});

				var flexDim = ((vertical ? innerSize.height : innerSize.width) - fixedDim) / flexChildren.length;

				flexChildren.forEach(function(childAndOptions) {
					var child = childAndOptions.element,
						options = childAndOptions.options,
						childBounds;

					if (has('ksf-monitoring')) {
						var timer = this._monitoring.childSizingTimer = child.style.get('name') + " sizing (flex)";
						console.groupCollapsed(timer);
						console.time(timer);
					}


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


					if (has('ksf-monitoring')) {
						console.timeEnd(self._monitoring.childSizingTimer);
						console.groupEnd();
					}


				}.bind(this));

				if (has('ksf-monitoring')) {
					console.timeEnd(this._monitoring.layoutTimer);
					console.groupEnd();
				}
			},

			startLiveRendering: function() {
				var self = this;
				return [
					OrderedContainerBase.prototype.startLiveRendering.apply(this),
					this.getEachR('inDom', 'bounds').onValue(function() {
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