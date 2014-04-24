define([
	'compose',
	'dojo/has',
], function(
	compose,
	has
){
	return compose({
		_sizeGetter: function() {
			if (has('ksf-monitoring')) {
				console.time("get computed size");
			}

			var node = this.domNode,
				compStyle = getComputedStyle(node);
			var size = {
				height: parseFloat(compStyle.getPropertyValue('height')),
				width: parseFloat(compStyle.getPropertyValue('width'))
			};

			if (has('ksf-monitoring')) {
				console.timeEnd("get computed size");
			}

			return size;
		}
	});
});