define([], function() {
	return {
		bounds: function(bounds) {
			var width = bounds && bounds.width || null;
			var height = bounds && bounds.height || null;
			var nodeStyle = this.domNode.style;
			nodeStyle.width = isNaN(width) ? width : width && (width + 'px');
			nodeStyle.height = isNaN(height) ? height : height && (height + 'px');
		}
	};
});