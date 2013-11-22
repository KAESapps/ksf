define([
	'compose'
], function(
	compose
){
	return compose({
		_sizeGetter: function() {
			// v----rendering log----v
			var timer = "get computed size";
			if (window.renderingLog) {
				console.time(timer);
			}
			// ^----rendering log----^

			var node = this.domNode;
			var size = {
				height: node.offsetHeight,
				width: node.offsetWidth
			};

			// v----rendering log----v
			console.timeEnd(timer);
			// ^----rendering log----^
			return size;
		},

		_sizeDetector: function() {
			return true;
		},

		_applyBounds: function() {
			// v----rendering log----v
			var timer = "apply bounds";
			if (window.renderingLog) {
				console.time(timer);
			}
			// ^----rendering log----^

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

			// v----rendering log----v
			console.timeEnd(timer);
			// ^----rendering log----^

		}
	});
});