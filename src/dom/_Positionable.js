define([], function() {
	return {
		/* Positionable API:

		- mode = absolute' | 'relative'
		
		# mode = 'absolute'
		- left
		- bottom
		- right
		- top
		
		# mode = 'relative'
		- orientation: 'vertical' | 'horizontal'
		- align: 'left' | 'right' | 'top' | 'bottom' | 'middle'

		 */
		position: function(position) {
			// get
			if (position === undefined) {
				return this._position;
			// set
			} else {
				var nodeCss = this.domNode.style;
				// reset previous
				for (var p in this._positionPreviousStyles) {
					nodeCss[p] = this._positionPreviousStyles[p];
				}

				// set new
				var positionCss = {};
				this._positionPreviousCss = {};
				
				if (position.mode === 'absolute') {
					positionCss.position = 'absolute';
					positionCss.left = position.left;
					positionCss.right = position.right;
					positionCss.top = position.top;
					positionCss.bottom = position.bottom;
				}
				else if (position.mode === 'relative') {
					positionCss.position = 'relative';
					if (position.orientation === 'horizontal') {
						positionCss.display = 'inline-' + (nodeCss.display || 'block');
						positionCss.verticalAlign = position.align;
					} else {
						positionCss.display = (nodeCss.display || 'block');
						if (position.align === 'left' || position.align === 'middle') {
							positionCss.marginRight = 'auto';
						}
						if (position.align === 'right' || position.align === 'middle') {
							positionCss.marginLeft = 'auto';
						}
					}
				}
				else {
					positionCss = position;
				}

				for (p in positionCss) {
					this._positionPreviousCss[p] = nodeCss[p];
					nodeCss[p] = positionCss[p];
				}

				this._position = position;
				return this;
			}
		}
	};
});