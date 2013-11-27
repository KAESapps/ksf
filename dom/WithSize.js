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

			var node = this.domNode;
			var size = {
				height: node.offsetHeight,
				width: node.offsetWidth
			};

			if (has('ksf-monitoring')) {
				console.timeEnd("get computed size");
			}

			return size;
		}
	});
});