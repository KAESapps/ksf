define([
	'compose'
], function(
	compose
){
	return compose({
		_applyBounds: function() {
			var bounds = this.get('bounds');
			if (!bounds) { return; }

			var width = bounds.width || null;
			var height = bounds.height || null;
			var heightMax = bounds.heightMax || null;
			var widthMax = bounds.widthMax || null;

			var nodeStyle = this.get('domNode').style;
			nodeStyle.width = width && (width + 'px');
			nodeStyle.height = height && (height + 'px');
			nodeStyle.maxHeight = heightMax && (heightMax + 'px');
			nodeStyle.maxWidth = widthMax && (widthMax + 'px');
		}
	});
});