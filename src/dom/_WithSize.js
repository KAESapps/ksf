define([], function() {
	return {
		size: function() {
			var cs = getComputedStyle(this.domNode),
				bb = cs.getPropertyValue('box-sizing') === 'border-box',
				height = parseFloat(cs.getPropertyValue('height')),
				width = parseFloat(cs.getPropertyValue('width'));

			if (!bb) {
				height += parseFloat(cs.getPropertyValue('padding-top') || 0);
				height += parseFloat(cs.getPropertyValue('padding-bottom') || 0);
				height += parseFloat(cs.getPropertyValue('border-top-width') || 0);
				height += parseFloat(cs.getPropertyValue('border-bottom-width') || 0);
				width += parseFloat(cs.getPropertyValue('padding-left') || 0);
				width += parseFloat(cs.getPropertyValue('padding-right') || 0);
				width += parseFloat(cs.getPropertyValue('border-left-width') || 0);
				width += parseFloat(cs.getPropertyValue('border-right-width') || 0);
			}
			return {
				height: height,
				width: width
			};
		}
	};
});