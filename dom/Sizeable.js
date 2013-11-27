define([
	'compose',
	'dojo/has',
], function(
	compose,
	has
){
	return compose({
		_applyBounds: function() {
			if (has('ksf-monitoring')) {
				console.time("apply bounds");
			}

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

			if (has('ksf-monitoring')) {
				console.timeEnd("apply bounds");
			}

		}
	});
});