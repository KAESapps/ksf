define([
	'compose'
], function(
	compose
){
	return compose({
		_sizeGetter: function() {
			var node = this.domNode;
			return {
				height: node.offsetHeight,
				width: node.offsetWidth
			};
		},

		_sizeDetector: function() {
			return true;
		},

		_applyBounds: function() {
			var bounds = this.get('bounds');
			if (!bounds) { return; }

			var width = bounds.width || null;
			var height = bounds.height || null;
			var heightMax = bounds.heightMax || null;
			var widthMax = bounds.widthMax || null;

			var nodeStyle = this.domNode.style;
			nodeStyle.width = width && (width + 'px');
			nodeStyle.height = height && (height + 'px');
			nodeStyle.maxHeight = heightMax && (heightMax + 'px');
			nodeStyle.maxWidth = widthMax && (widthMax + 'px');
		}
	});
});