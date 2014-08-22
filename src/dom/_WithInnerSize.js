define([], function() {
	return {
		_innerSize: function() {
			var cs = getComputedStyle(this.domNode),
				bb = cs.getPropertyValue('box-sizing') === 'border-box',
				height = cs.getPropertyValue('height'),
				width = cs.getPropertyValue('width');

			if (height === 'auto' || width === 'auto') {
				// means that display is not block or inline-block
				// probably a misuse, throw an exception
				throw "Tried to measure a node that is not block or inline-block";
			} else {
				height = parseFloat(height);
				if (bb) {
					height -= parseFloat(cs.getPropertyValue('padding-top') || 0);
					height -= parseFloat(cs.getPropertyValue('padding-bottom') || 0);
					height -= parseFloat(cs.getPropertyValue('border-top-width') || 0);
					height -= parseFloat(cs.getPropertyValue('border-bottom-width') || 0);	
				}
				width = parseFloat(width);
				if (bb) {
					width -= parseFloat(cs.getPropertyValue('padding-left') || 0);
					width -= parseFloat(cs.getPropertyValue('padding-right') || 0);
					width -= parseFloat(cs.getPropertyValue('border-left-width') || 0);
					width -= parseFloat(cs.getPropertyValue('border-right-width') || 0);
				}
			}

			return {
				height: height,
				width: width
			};
		}
	};
});